import { BaseSystem } from "../systems/base-system.js";
import { IEntityManager, IEventManager, ISystemManager } from "../types/common-interfaces.js";
import { SystemMap, SystemType } from "../types/common-types.js";
import { SystemError } from "../types/errors.js";
import { ComponentEvent, GameEventType } from "../constants/events.js";
import { PriorityQueue } from "../utils/priority-queue.js";

export class SystemManager implements ISystemManager {
  entityManager: IEntityManager;
  eventManager: IEventManager;
  executionQueue: PriorityQueue<BaseSystem>;
  systems: Map<SystemType, SystemMap[SystemType]>;
  systemEntities: Map<SystemType, Set<number>>;

  constructor(entityManager: IEntityManager, eventManager: IEventManager) {
    this.entityManager = entityManager;
    this.eventManager = eventManager;
    this.executionQueue = new PriorityQueue<BaseSystem>((a, b) => a.priority - b.priority);
    this.systems = new Map();
    this.systemEntities = new Map();
    this.#bindEvents();
  }

  update(dt: number): void {
    this.executionQueue.forEach((system) => {
      if (system.enabled) {
        system.update(dt, this.systemEntities.get(system.name)!);
      }
    });
  }

  addSystem(system: BaseSystem): void {
    if (this.systems.has(system.name)) {
      throw new SystemError(`System with name ${system.name} already registered.`);
    }

    this.systems.set(system.name, system);
    this.systemEntities.set(system.name, new Set());
    this.executionQueue.add(system, system.priority);
    system.init?.();

    this.eventManager.trigger(GameEventType.SYSTEM_ADDED, system);
  }

  removeSystem(systemName: SystemType): void {
    const system = this.systems.get(systemName);
    if (typeof system === "undefined") {
      return;
    }

    this.executionQueue.remove(system);
    system.cleanup?.();
    this.systems.delete(systemName);
    this.systemEntities.delete(systemName);

    this.eventManager.trigger(GameEventType.SYSTEM_REMOVED, system);
  }

  getSystem<T extends SystemType>(name: T): SystemMap[T] | undefined {
    return this.systems.get(name) as SystemMap[T] | undefined;
  }

  setSystemEnabled(systemName: SystemType, enabled: boolean): void {
    const system = this.systems.get(systemName);
    if (typeof system === "undefined") {
      return;
    }
    system.enabled = enabled;
  }

  #bindEvents() {
    this.eventManager.on(GameEventType.COMPONENT_ADDED, this.#onComponentAdded.bind(this));
    this.eventManager.on(GameEventType.COMPONENT_REMOVED, this.#onComponentRemoved.bind(this));
    this.eventManager.on(GameEventType.ENTITY_DESTROYED, this.#onEntityDestroyed.bind(this));
  }

  #onComponentAdded(event: ComponentEvent): void {
    for (let [systemName, system] of this.systems) {
      if (system.isInterestedInComponent(event.component) && system.belongsToSystem(event.entity)) {
        this.systemEntities.get(systemName)!.add(event.entity);
      }
    }
  }

  #onComponentRemoved(event: ComponentEvent): void {
    for (let [systemName, system] of this.systems) {
      if (!system.belongsToSystem(event.entity)) {
        const entitySet = this.systemEntities.get(systemName)!;
        entitySet.add(event.entity);
      }
    }
  }

  #onEntityDestroyed(entity: number): void {
    for (let entitySet of this.systemEntities.values()) {
      entitySet.delete(entity);
    }
  }
}
