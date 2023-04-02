/* eslint-disable no-unused-vars */
import { EntityManager } from "../entities/entity-manager.js";
import { EventSystem } from "../events/event-system.js";
import { Guard } from "../utils/guard.js";

export class CollisionStrategy {
  /** @type {EntityManager} */
  entityManager;
  /** @type {EventSystem} */
  eventSystem;

  /**
   *
   * @param {EntityManager} entityManager
   * @param {EventSystem} eventSystem
   */
  constructor(entityManager, eventSystem) {
    Guard.againstNull({ entityManager }).isInstanceOf(EntityManager);
    Guard.againstNull({ eventSystem }).isInstanceOf(EventSystem);
    this.entityManager = entityManager;
    this.eventSystem = eventSystem;
  }

  /** @type {number[]} */
  resolve(entities) {
    throw new Error("`check` must be implemented.");
  }

  /** @returns {boolean} */
  areEntitiesColliding() {
    throw new Error("`resolve` must be implemented.");
  }
}
