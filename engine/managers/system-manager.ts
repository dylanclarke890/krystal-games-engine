import { GameEvents } from "../constants/enums.js";
import { IEntityManager, IEventManager, ISystem } from "../types/common-interfaces.js";
import { SystemError } from "../types/errors.js";
import { PriorityQueue } from "../utils/priority-queue.js";

export class SystemManager {
  entityManager: IEntityManager;
  eventManager: IEventManager;
  executionQueue: PriorityQueue<ISystem>;
  systems: Map<string, ISystem>;
  systemEntities: Map<string, Set<number>>;

  constructor(entityManager: IEntityManager, eventManager: IEventManager) {
    this.entityManager = entityManager;
    this.eventManager = eventManager;
    this.executionQueue = new PriorityQueue<ISystem>((a, b) => a.priority - b.priority);
    this.systems = new Map();
    this.systemEntities = new Map();
  }

  bindEvents() {
    this.eventManager.on(GameEvents.Entity_ComponentAdded, () => {});
  }

  /**
   * Register a system.
   * @param system The system to register.
   */
  registerSystem(system: ISystem): void {
    if (this.systems.has(system.name)) {
      throw new SystemError(`System with name ${system.name} already registered.`);
    }

    this.systems.set(system.name, system);
    this.systemEntities.set(system.name, new Set());
    this.executionQueue.add(system, system.priority);
    system.init?.();
  }

  /**
   * Unregister a system.
   * @param systemName The name of the system to unregister.
   */
  unregisterSystem(systemName: string): void {
    const system = this.systems.get(systemName);
    if (typeof system === "undefined") {
      return;
    }

    this.executionQueue.remove(system);
    system.destroy?.();
    this.systems.delete(systemName);
    this.systemEntities.delete(systemName);
  }

  /**
   * Update all registered systems in the order of their priority.
   * @param dt Time since the last frame.
   */
  update(dt: number): void {
    this.executionQueue.forEach((system) => {
      if (system.enabled) {
        const relevantEntities = new Set<number>();
        this.entityManager.entities.forEach((entity) => {
          if (system.belongsToSystem(entity)) {
            relevantEntities.add(entity);
          }
        });
        system.update(dt, relevantEntities);
      }
    });
  }

  /**
   * Enable or disable a system.
   * @param systemName The name of the system.
   * @param enabled Whether the system should be enabled or disabled.
   */
  setSystemEnabled(systemName: string, enabled: boolean): void {
    const system = this.systems.get(systemName);
    if (typeof system === "undefined") {
      return;
    }
    system.enabled = enabled;
  }
}
