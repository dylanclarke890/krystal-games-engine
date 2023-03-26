import { SystemTypes } from "./system-types.js";
import { System } from "./system.js";

export class PhysicsSystem extends System {
  static requiredComponents = ["PositionComponent", "VelocityComponent"];
  static systemType = SystemTypes.Physics;

  update(dt) {
    const entities = this.entityManager.getEntitiesWithComponents(
      ...PhysicsSystem.requiredComponents
    );

    for (let i = 0; i < entities.length; i++) {
      const entity = entities[i];
      const position = this.entityManager.getComponent(entity, "PositionComponent");
      const velocity = this.entityManager.getComponent(entity, "VelocityComponent");
      position.move(velocity.x * dt, velocity.y * dt);
    }
  }
}
