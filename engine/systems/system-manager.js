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

  constructor(eventSystem, entityManager) {
    Guard.againstNull({ eventSystem }).isInstanceOf(EventSystem);
    Guard.againstNull({ entityManager }).isInstanceOf(EntityManager);
    this.eventSystem = eventSystem;
    this.entityManager = entityManager;
    this.systems = new Set();
    this.#bindEvents();
  }

  #bindEvents() {
    this.eventSystem.on(GameEvents.Loop_NextFrame, (dt) => this.update(dt));
  }

  /**
   * @param {string[]} requiredComponents
   * @param {boolean} throwIfMissing
   * @returns {boolean}
   */
  #ensureRequiredComponentsArePresent(requiredComponents, throwIfMissing) {
    Guard.againstNull({ requiredComponents });
    for (const componentType of requiredComponents) {
      if (!this.entityManager.hasComponentType(componentType)) {
        if (throwIfMissing) throw new Error(`Missing required component type: ${componentType}`);
        else return false;
      }
    }
    return true;
  }

  registerSystem(system) {
    Guard.againstNull({ system }).isInstanceOf(System);
    Guard.againstNull({ systemType: system.constructor.systemType }).isInstanceOf(SystemTypes);
    const isPresent = this.#ensureRequiredComponentsArePresent(
      system.constructor.requiredComponents,
      false
    );
    if (isPresent) this.systems.add(system);
  }

  unregisterSystem(system) {
    this.systems.delete(system);
  }

  update(dt) {
    for (const system of this.systems) system.update(dt);
  }
}
