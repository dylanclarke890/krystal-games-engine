import { Guard } from "../utils/guard.js";

export class System {
  /** @param {import("../managers/entity-manager.js").EntityManager} entityManager */
  constructor(entityManager) {
    Guard.againstNull({ entityManager });
    this.entityManager = entityManager;
  }

  static requiredComponents = [];

  update() {
    throw new Error("Update method must be implemented.");
  }
}
