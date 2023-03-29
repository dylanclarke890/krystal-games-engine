import { Viewport } from "../graphics/viewport.js";
import { Guard } from "../utils/guard.js";
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

export class PhysicsSystem2 extends System {
  static requiredComponents = ["PositionComponent", "VelocityComponent"];
  static systemType = SystemTypes.Physics;

  viewport;

  /**
   *
   * @param {import("../entities/entity-manager.js").EntityManager} entityManager
   * @param {Viewport} viewport
   */
  constructor(entityManager, viewport) {
    super(entityManager);
    Guard.againstNull({ viewport }).isInstanceOf(Viewport);
    this.viewport = viewport;
  }

  update(deltaTime) {
    const entities = this.entityManager.getEntitiesWithComponents(
      ...PhysicsSystem2.requiredComponents
    );
    for (const entity of entities) {
      const position = entity.getComponent("PositionComponent");
      const velocity = entity.getComponent("VelocityComponent");
      const acceleration = entity.getComponent("AccelerationComponent");
      const friction = entity.getComponent("FrictionComponent");
      const size = entity.getComponent("SizeComponent");
      const offset = entity.getComponent("OffsetComponent");
      const gravityFactor = entity.getComponent("GravityFactorComponent");
      const bounciness = entity.getComponent("BouncinessComponent");
      const minBounceVelocity = entity.getComponent("MinBounceVelocityComponent");

      // Apply acceleration
      if (acceleration) {
        velocity.x += acceleration.x * deltaTime;
        velocity.y += acceleration.y * deltaTime;
      }

      // Apply friction
      if (friction) {
        velocity.x *= Math.pow(friction.x, deltaTime);
        velocity.y *= Math.pow(friction.y, deltaTime);
      }

      // Apply gravity
      if (gravityFactor) {
        velocity.y += 9.81 * gravityFactor.value * deltaTime;
      }

      // Apply position
      position.x += velocity.x * deltaTime;
      position.y += velocity.y * deltaTime;
      
      const canvasWidth = this.viewport.canvas.width;

      // Handle collisions with the walls
      if (position.x + offset.x < 0) {
        position.x = -offset.x;
        // bounciness
        if (bounciness) velocity.x = -velocity.x * bounciness.value;
        if (minBounceVelocity && Math.abs(velocity.x) < minBounceVelocity.value) {
          velocity.x = 0;
        }
      }

      if (position.x + offset.x + size.x > canvasWidth) {
        position.x = canvasWidth - size.x - offset.x;
        if (bounciness) velocity.x = -velocity.x * bounciness.value;
        if (minBounceVelocity && Math.abs(velocity.x) < minBounceVelocity.value) {
          velocity.x = 0;
        }
      }

      if (position.y + offset.y < 0) {
        position.y = -offset.y;
        if (bounciness) velocity.y = -velocity.y * bounciness.value;
        if (minBounceVelocity && Math.abs(velocity.y) < minBounceVelocity.value) {
          velocity.y = 0;
        }
      }

      if (position.y + offset.y + size.y > canvasWidth) {
        position.y = canvasWidth - size.y - offset.y;
        if (bounciness) velocity.y = -velocity.y * bounciness.value;
        if (minBounceVelocity && Math.abs(velocity.y) < minBounceVelocity.value) {
          velocity.y = 0;
        }
      }
    }
  }
}
