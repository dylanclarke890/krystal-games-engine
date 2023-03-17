import { Guard } from "../utils/guard.js";

export class System {
  /** @type {string[]} */
  static requiredComponents;

  /** @param {import("../managers/entity-manager.js").EntityManager} entityManager */
  constructor(entityManager) {
    Guard.againstNull({ entityManager });
    this.entityManager = entityManager;
  }

  update() {
    throw new Error("Update method must be implemented.");
  }
}
