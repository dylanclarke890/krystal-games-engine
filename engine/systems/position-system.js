import { SystemTypes } from "./system-types.js";
import { System } from "./system.js";

export class PositionSystem extends System {
  static requiredComponents = ["PositionComponent"];
  static systemType = SystemTypes.Position;

  update() {
    const entities = this.entityManager.getEntitiesWithComponents("PositionComponent");
    console.log(entities);
  }
}
