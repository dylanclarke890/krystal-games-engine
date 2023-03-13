import { Guard } from "../../lib/sanity/guard.js";

export class SystemBase {
  constructor(entityManager) {
    Guard.againstNull({ entityManager });
    this.entityManager = entityManager;
  }

  update() {
    throw new Error("Update method must be implemented.");
  }
}
