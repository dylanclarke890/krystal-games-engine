import { EntityManager } from "../entities/entity-manager.js";
import { EventSystem } from "../events/event-system.js";
import { GameEvents } from "../events/events.js";
import { Assert } from "../utils/assert.js";
import { SystemTypes } from "./system-types.js";
import { System } from "./system.js";

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
    this.systems.forEach((system) => this.#validateSystem(system));
  }

  #validateSystem(system: System): void {
    const name = (<typeof System>system.constructor).name;
    const required = (<typeof System>system.constructor).requiredComponents;
    const type = (<typeof System>system.constructor).systemType;

    Assert.defined(`${name} requiredComponents`, required);
    Assert.instanceOf(`${name} systemType`, type, SystemTypes);

    for (const componentType of required) {
      if (this.entityManager.hasComponentType(componentType)) {
        continue;
      }
      const message = `Missing required component type: ${componentType}`;
      if (this.#throwIfMissing) {
        throw new Error(message);
      } else console.warn(message);
    }
  }

  registerSystem(system: System) {
    Assert.defined("System", system);
    this.systems.add(system);
  }

  unregisterSystem(system: System) {
    this.systems.delete(system);
  }

  update(dt: number) {
    for (const system of this.systems) system.update(dt);
  }
}
