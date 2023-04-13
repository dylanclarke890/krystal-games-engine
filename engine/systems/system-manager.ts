import { EntityManager } from "../entities/entity-manager.js";
import { EventSystem } from "../events/event-system.js";
import { GameEvents } from "../events/events.js";
import { Assert } from "../utils/assert.js";
import { Guard } from "../utils/guard.js";
import { Result } from "../utils/types.js";
import { SystemTypes } from "./system-types.js";
import { RequiredComponent, System } from "./system.js";

export class SystemManager {
  eventSystem: EventSystem;
  entityManager: EntityManager;
  systems: Set<System>;

  #throwIfMissing: boolean;

  /**
   *
   * @param {EventSystem} eventSystem
   * @param {EntityManager} entityManager
   * @param {boolean} throwIfMissing
   */
  constructor(eventSystem: EventSystem, entityManager: EntityManager, throwIfMissing?: boolean) {
    Assert.instanceOf("eventSystem", eventSystem, EventSystem);
    Assert.instanceOf("entityManager", entityManager, EntityManager);

    this.eventSystem = eventSystem;
    this.entityManager = entityManager;
    this.#throwIfMissing = !!throwIfMissing;

    this.systems = new Set();
    this.#bindEvents();
  }

  #bindEvents() {
    this.eventSystem.on(GameEvents.Loop_BeforeStart, () => this.#beforeStart());
    this.eventSystem.on(GameEvents.Loop_NextFrame, (dt: number) => this.update(dt));
  }

  #beforeStart() {
    this.systems.forEach((system) => {
      const required = (<typeof System>system.constructor).requiredComponents;
      const result = this.#validateSystem((<typeof System>system.constructor).name, required);
      if (!result.success) console.warn(result.message);
    });
  }

  #validateSystem(name: string, requiredComponents: RequiredComponent[]): Result {
    Assert.defined(`${name} requiredComponents`, requiredComponents);

    for (const componentType of requiredComponents) {
      if (this.entityManager.hasComponentType(componentType)) {
        continue;
      }
      const message = `Missing required component type: ${componentType}`;

      if (this.#throwIfMissing) {
        throw new Error(message);
      }

      return { success: false, message };
    }
    return { success: true };
  }

  registerSystem(system: System) {
    Guard.againstNull({ system }).isInstanceOf(System);
    Guard.againstNull({ systemType: (<typeof System>system.constructor).systemType }).isInstanceOf(
      SystemTypes
    );
    this.systems.add(system);
  }

  unregisterSystem(system: System) {
    this.systems.delete(system);
  }

  update(dt: number) {
    for (const system of this.systems) system.update(dt);
  }
}
