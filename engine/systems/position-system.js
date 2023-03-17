import { System } from "./system.js";

export class PositionSystem extends System {
  static requiredComponents = ["PositionComponent"];

  update() {
    const entities = this.entityManager.getEntitiesWithComponents("PositionComponent");
    console.log(entities);
  }
}
