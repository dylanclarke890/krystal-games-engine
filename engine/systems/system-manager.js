import { EntityManager } from "../entities/entity-manager.js";
import { EventSystem } from "../events/event-system.js";
import { Guard } from "../utils/guard.js";

export class SystemManager {
  /** @type {EventSystem} */
  eventSystem;
  /** @type {EntityManager} */
  entityManager;

  constructor(eventSystem, entityManager) {
    Guard.againstNull({ eventSystem }).isInstanceOf(EventSystem);
    Guard.againstNull({ entityManager }).isInstanceOf(EntityManager);
    this.eventSystem = eventSystem;
    this.entityManager = entityManager;
  }
}
