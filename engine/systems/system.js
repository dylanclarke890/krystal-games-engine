import { Guard } from "../utils/guard.js";

export class System {
  /** @type {string[]} */
  static requiredComponents;
  /** @type {import("../entities/entity-manager.js").EntityManager} */
  entityManager;

  /** @param {import("../managers/entity-manager.js").EntityManager} entityManager */
  constructor(entityManager) {
    Guard.againstNull({ entityManager });
    this.entityManager = entityManager;
  }

  update() {
    throw new Error("Update method must be implemented.");
  }
}
