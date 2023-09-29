import { IEventManager, ISystem } from "../types/common-interfaces.js";
import { PriorityQueue } from "../utils/priority-queue.js";

export class SystemManager {
  eventManager: IEventManager;
  systems: Map<string, ISystem> = new Map();
  executionQueue: PriorityQueue<ISystem>;

  constructor(eventManager: IEventManager) {
    this.eventManager = eventManager;
    this.executionQueue = new PriorityQueue<ISystem>((a, b) => a.priority - b.priority);
  }

  /**
   * Register a system.
   * @param system The system to register.
   */
  registerSystem(system: ISystem) {
    if (this.systems.has(system.name)) {
      console.warn(`System with name ${system.name} already registered.`);
      return;
    }

    this.systems.set(system.name, system);
    this.executionQueue.add(system, system.priority);
    system.init();
  }

  /**
   * Unregister a system.
   * @param systemName The name of the system to unregister.
   */
  unregisterSystem(systemName: string) {
    const system = this.systems.get(systemName);
    if (system) {
      this.executionQueue.remove(system);
      if (system.destroy) {
        system.destroy();
      }
      this.systems.delete(systemName);
    }
  }

  /**
   * Update all registered systems in the order of their priority.
   * @param dt Time since the last frame.
   */
  update(dt: number) {
    this.executionQueue.forEach((system) => {
      if (system.enabled) {
        system.update(dt);
      }
    });
  }

  /**
   * Enable or disable a system.
   * @param systemName The name of the system.
   * @param enabled Whether the system should be enabled or disabled.
   */
  setSystemEnabled(systemName: string, enabled: boolean) {
    const system = this.systems.get(systemName);
    if (system) {
      system.enabled = enabled;
    }
  }
}
