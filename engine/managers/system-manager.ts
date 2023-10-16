import { BaseSystem } from "../systems/base-system.js";
import { IEntityManager, IEventManager, ISystemManager } from "../types/common-interfaces.js";
import { SystemGroup } from "../types/common-types.js";
import { SystemError } from "../types/errors.js";
import { ComponentEvent, GameEventType } from "../constants/events.js";
import { PriorityQueue } from "../utils/priority-queue.js";

export class SystemManager implements ISystemManager {
  static GroupExecutionOrder: SystemGroup[] = [
    "pre-input",
    "input",
    "post-input",
    "pre-physics",
    "physics",
    "post-physics",
    "pre-render",
    "render",
    "post-render",
    "custom",
  ];
  entityManager: IEntityManager;
  eventManager: IEventManager;
  systems: Map<string, BaseSystem>;
  systemEntities: Map<string, Set<number>>;
  systemGroups: Map<SystemGroup, PriorityQueue<BaseSystem>>;

  constructor(entityManager: IEntityManager, eventManager: IEventManager) {
    this.entityManager = entityManager;
    this.eventManager = eventManager;
    this.systems = new Map();
    this.systemEntities = new Map();
    this.systemGroups = new Map();
    for (let group of SystemManager.GroupExecutionOrder) {
      this.systemGroups.set(group, new PriorityQueue<BaseSystem>((a, b) => a.priority - b.priority));
    }
    this.#bindEvents();
  }

  update(dt: number): void {
    for (let group of SystemManager.GroupExecutionOrder) {
      const priorityQueue = this.systemGroups.get(group)!;
      priorityQueue.forEach((system) => {
        if (system.enabled) {
          system.update(dt, this.systemEntities.get(system.name)!);
        }
      });
    }
  }

  addSystem(system: BaseSystem): void {
    if (this.systems.has(system.name)) {
      throw new SystemError(`System with name ${system.name} already registered.`);
    }

    this.systems.set(system.name, system);
    this.systemEntities.set(system.name, new Set());
    this.systemGroups.get(system.group)!.add(system, system.priority);

    system.init?.();
    this.eventManager.trigger(GameEventType.SYSTEM_ADDED, system);
  }

  removeSystem(name: string): void {
    const system = this.systems.get(name);
    if (typeof system === "undefined") {
      throw new SystemError("Cannot find a matching system to remove.", name);
    }
    system.cleanup?.();

    this.systemGroups.get(system.group)!.remove(system);
    this.systems.delete(name);
    this.systemEntities.delete(name);

    this.eventManager.trigger(GameEventType.SYSTEM_REMOVED, system);
  }

  getSystem<T extends BaseSystem>(name: string): T | undefined {
    return this.systems.get(name) as T | undefined;
  }

  setSystemEnabled(name: string, enabled: boolean): void {
    const system = this.systems.get(name);
    if (typeof system === "undefined") {
      throw new SystemError("Cannot find a matching system to update.", name);
    }
    system.enabled = enabled;
    this.eventManager.trigger(enabled ? GameEventType.SYSTEM_ENABLED : GameEventType.SYSTEM_DISABLED, system);
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
