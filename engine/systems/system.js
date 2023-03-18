import { EntityManager } from "../entities/entity-manager.js";
import { Guard } from "../utils/guard.js";

export class System {
  /** @type {string[]} */
  static requiredComponents;
  /** @type {string} */
  static systemType;

  /** @type {EntityManager} */
  entityManager;

  /** @param {EntityManager} entityManager */
  constructor(entityManager) {
    Guard.againstNull({ entityManager }).isInstanceOf(EntityManager);
    this.entityManager = entityManager;
  }

  /**
   * @param {number} dt Delta time since last frame.
   */
  // eslint-disable-next-line no-unused-vars
  update(dt) {
    throw new Error("Update method must be implemented.");
  }
}
