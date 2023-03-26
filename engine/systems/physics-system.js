import { SystemTypes } from "./system-types.js";
import { System } from "./system.js";

export class PhysicsSystem extends System {
  static requiredComponents = ["PositionComponent", "VelocityComponent"];
  static systemType = SystemTypes.Physics;

  update() {
    const entities = this.entityManager.getEntitiesWithComponents(
      ...PhysicsSystem.requiredComponents
    );
  }
}
