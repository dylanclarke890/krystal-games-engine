import { EntityManager } from "../entities/entity-manager.js";
import { EventSystem } from "../events/event-system.js";
import { GameEvents } from "../events/events.js";
import { Guard } from "../utils/guard.js";
import { SystemTypes } from "./system-types.js";
import { System } from "./system.js";

export class SystemManager {
  /** @type {EventSystem} */
  eventSystem;
  /** @type {EntityManager} */
  entityManager;
  /** @type {Set<System>} */
  systems;

  /** @type {boolean} */
  #throwIfMissing;

  /**
   *
   * @param {EventSystem} eventSystem
   * @param {EntityManager} entityManager
   * @param {boolean} throwIfMissing
   */
  constructor(eventSystem, entityManager, throwIfMissing) {
    Guard.againstNull({ eventSystem }).isInstanceOf(EventSystem);
    Guard.againstNull({ entityManager }).isInstanceOf(EntityManager);
    this.eventSystem = eventSystem;
    this.entityManager = entityManager;
    this.#throwIfMissing = !!throwIfMissing;

    this.systems = new Set();
    this.#bindEvents();
  }

  #bindEvents() {
    this.eventSystem.on(GameEvents.Loop_NextFrame, (dt) => this.update(dt));
  }

  /**
   * @param {string[]} requiredComponents
   * @returns {{success: boolean, message: string?}}
   */
  #ensureRequiredComponentsArePresent(requiredComponents) {
    Guard.againstNull({ requiredComponents });
    for (const componentType of requiredComponents) {
      if (this.entityManager.hasComponentType(componentType)) continue;

      const msg = `Missing required component type: ${componentType}`;
      if (this.#throwIfMissing) throw new Error(msg);
      else return { success: true, message: msg };
    }
    return { success: true, message: "" };
  }

  registerSystem(system) {
    Guard.againstNull({ system }).isInstanceOf(System);
    Guard.againstNull({ systemType: system.constructor.systemType }).isInstanceOf(SystemTypes);
    const result = this.#ensureRequiredComponentsArePresent(system.constructor.requiredComponents);
    if (result.success) this.systems.add(system);
    else console.warn(result.message);
  }

  unregisterSystem(system) {
    this.systems.delete(system);
  }

  update(dt) {
    for (const system of this.systems) system.update(dt);
  }
}
