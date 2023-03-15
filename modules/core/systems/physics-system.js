import { SystemBase } from "./base-system.js";

export class PhysicsSystem extends SystemBase {
  constructor(entityManager) {
    super(entityManager);
  }

  update() {
    const entities = this.entityManager.getEntitiesWithComponents("position", "velocity");
  }
}
