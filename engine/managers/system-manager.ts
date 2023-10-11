import { BaseComponent } from "../components/base.js";
import { GameEvents } from "../constants/enums.js";
import { BaseSystem } from "../systems/base-system.js";
import { IEntityManager, IEventManager } from "../types/common-interfaces.js";
import { SystemMap, SystemType } from "../types/common-types.js";
import { SystemError } from "../types/errors.js";
import { PriorityQueue } from "../utils/priority-queue.js";

export class SystemManager {
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
    this.bindEvents();
  }

  bindEvents() {
    this.eventManager.on(GameEvents.LOOP_STARTED, (dt: number) => this.update(dt));

    this.eventManager.on(GameEvents.COMPONENT_ADDED, (data: { entity: number; component: BaseComponent }) =>
      this.#onComponentAdded(data.entity, data.component)
    );

    this.eventManager.on(GameEvents.COMPONENT_REMOVED, (data: { entity: number; component: BaseComponent }) =>
      this.#onComponentRemoved(data.entity)
    );

    this.eventManager.on(GameEvents.ENTITY_DESTROYED, (entity: number) => this.#onEntityDestroyed(entity));
  }

  #onComponentAdded(entity: number, component: BaseComponent): void {
    for (let [systemName, system] of this.systems) {
      if (system.isInterestedInComponent(component)) {
        const entitySet = this.systemEntities.get(systemName)!;
        if (system.belongsToSystem(entity)) {
          entitySet.add(entity);
        }
      }
    }
  }

  #onComponentRemoved(entity: number): void {
    for (let [systemName, system] of this.systems) {
      const entitySet = this.systemEntities.get(systemName)!;
      if (system.belongsToSystem(entity)) {
        entitySet.add(entity);
      }
    }
  }

  #onEntityDestroyed(entity: number): void {
    for (let entitySet of this.systemEntities.values()) {
      entitySet.delete(entity);
    }
  }

  /**
   * Register a system for updates.
   * @param system The system to register.
   */
  addSystem(system: BaseSystem): void {
    if (this.systems.has(system.name)) {
      throw new SystemError(`System with name ${system.name} already registered.`);
    }

    this.systems.set(system.name, system);
    this.systemEntities.set(system.name, new Set());
    this.executionQueue.add(system, system.priority);
    system.init?.();

    this.eventManager.trigger(GameEvents.SYSTEM_ADDED);
  }

  getSystem<T extends SystemType>(name: T): SystemMap[T] | undefined {
    return this.systems.get(name) as SystemMap[T] | undefined;
  }

  /**
   * Unregister a system.
   * @param systemName The name of the system to unregister.
   */
  removeSystem(systemName: SystemType): void {
    const system = this.systems.get(systemName);
    if (typeof system === "undefined") {
      return;
    }

    this.executionQueue.remove(system);
    system.cleanup?.();
    this.systems.delete(systemName);
    this.systemEntities.delete(systemName);

    this.eventManager.trigger(GameEvents.SYSTEM_REMOVED);
  }

  /**
   * Update all registered systems in the order of their priority.
   * @param dt Time since the last frame.
   */
  update(dt: number): void {
    this.executionQueue.forEach((system) => {
      if (system.enabled) {
        system.update(dt, this.systemEntities.get(system.name)!);
      }
    });
  }

  /**
   * Enable or disable a system.
   * @param systemName The name of the system.
   * @param enabled Whether the system should be enabled or disabled.
   */
  setSystemEnabled(systemName: SystemType, enabled: boolean): void {
    const system = this.systems.get(systemName);
    if (typeof system === "undefined") {
      return;
    }
    system.enabled = enabled;
  }
}
