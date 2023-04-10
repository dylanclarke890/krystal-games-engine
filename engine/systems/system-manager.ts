import { EntityManager } from "../entities/entity-manager";
import { EventSystem } from "../events/event-system";
import { GameEvents } from "../events/events";
import { Guard } from "../utils/guard";
import { SystemTypes } from "./system-types";
import { System } from "./system";

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
  constructor(eventSystem: EventSystem, entityManager: EntityManager, throwIfMissing: boolean) {
    Guard.againstNull({ eventSystem }).isInstanceOf(EventSystem);
    Guard.againstNull({ entityManager }).isInstanceOf(EntityManager);
    this.eventSystem = eventSystem;
    this.entityManager = entityManager;
    this.#throwIfMissing = !!throwIfMissing;

    this.systems = new Set();
    this.#bindEvents();
  }

  #bindEvents() {
    this.eventSystem.on(GameEvents.Loop_BeforeStart, () => this.#beforeStart());
    this.eventSystem.on(GameEvents.Loop_NextFrame, (dt) => this.update(dt));
  }

  #beforeStart() {
    this.systems.forEach((system) => {
      const required = (system.constructor as any).requiredComponents;
      const result = this.#ensureRequiredComponentsArePresent(required);
      if (!result.success) console.warn(result.message);
    });
  }

  /**
   * @param {string[]} requiredComponents
   * @returns {{success: boolean, message: string?}}
   */
  #ensureRequiredComponentsArePresent(requiredComponents: string[]): {
    success: boolean;
    message: string | null;
  } {
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
    this.systems.add(system);
  }

  unregisterSystem(system) {
    this.systems.delete(system);
  }

  update(dt) {
    for (const system of this.systems) system.update(dt);
  }
}
