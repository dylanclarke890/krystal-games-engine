import { SystemTypes } from "./system-types.js";
import { System } from "./system.js";

export class PositionSystem extends System {
  static requiredComponents = ["Position"];
  static systemType = SystemTypes.Position;

  update() {
    const entities = this.entityManager.getEntitiesWithComponents(
      ...PositionSystem.requiredComponents
    );
  }
}
