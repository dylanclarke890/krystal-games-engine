import { SystemBase } from "./base-system.js";

export class PositionSystem extends SystemBase {
  constructor(entityManager) {
    super(entityManager);
  }

  update() {
    const entities = this.entityManager.getEntitiesWithComponents("position");
    console.log(entities);
  }
}
