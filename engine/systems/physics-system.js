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


import {
  PositionComponent,
  VelocityComponent,
  AccelerationComponent,
  FrictionComponent,
  SizeComponent,
  OffsetComponent,
  GravityFactorComponent,
  BouncinessComponent,
  MinBounceVelocityComponent,
} from "./components.js";

export class PhysicsSystem2 {
  constructor(entities) {
    this.entities = entities;
  }

  update(deltaTime) {
    for (const entity of this.entities) {
      const position = entity.getComponent(PositionComponent);
      const velocity = entity.getComponent(VelocityComponent);
      const acceleration = entity.getComponent(AccelerationComponent);
      const friction = entity.getComponent(FrictionComponent);
      const size = entity.getComponent(SizeComponent);
      const offset = entity.getComponent(OffsetComponent);
      const gravityFactor = entity.getComponent(GravityFactorComponent);
      const bounciness = entity.getComponent(BouncinessComponent);
      const minBounceVelocity = entity.getComponent(MinBounceVelocityComponent);

      // Apply acceleration
      velocity.x += acceleration.x * deltaTime;
      velocity.y += acceleration.y * deltaTime;

      // Apply friction
      velocity.x *= Math.pow(friction.x, deltaTime);
      velocity.y *= Math.pow(friction.y, deltaTime);

      // Apply gravity
      velocity.y += 9.81 * gravityFactor.value * deltaTime;

      // Apply position
      position.x += velocity.x * deltaTime;
      position.y += velocity.y * deltaTime;

      // Handle collisions with the walls
      if (position.x + offset.x < 0) {
        position.x = -offset.x;
        velocity.x = -velocity.x * bounciness.value;
        if (Math.abs(velocity.x) < minBounceVelocity.value) {
          velocity.x = 0;
        }
      }
      if (position.x + offset.x + size.x > canvas.width) {
        position.x = canvas.width - size.x - offset.x;
        velocity.x = -velocity.x * bounciness.value;
        if (Math.abs(velocity.x) < minBounceVelocity.value) {
          velocity.x = 0;
        }
      }
      if (position.y + offset.y < 0) {
        position.y = -offset.y;
        velocity.y = -velocity.y * bounciness.value;
        if (Math.abs(velocity.y) < minBounceVelocity.value) {
          velocity.y = 0;
        }
      }
      if (position.y + offset.y + size.y > canvas.height) {
        position.y = canvas.height - size.y - offset.y;
        velocity.y = -velocity.y * bounciness.value;
        if (Math.abs(velocity.y) < minBounceVelocity.value) {
          velocity.y = 0;
        }
      }
    }
  }
}