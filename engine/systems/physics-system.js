import { Viewport } from "../graphics/viewport.js";
import { Guard } from "../utils/guard.js";
import { SystemTypes } from "./system-types.js";
import { System } from "./system.js";

export class PhysicsSystem extends System {
  static requiredComponents = ["PositionComponent", "VelocityComponent", "SizeComponent"];
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
    const em = this.entityManager;
    const entities = em.getEntitiesWithComponents(...PhysicsSystem.requiredComponents);
    for (const entity of entities) {
      const position = em.getComponent(entity, "PositionComponent");
      const velocity = em.getComponent(entity, "VelocityComponent");
      const size = em.getComponent(entity, "SizeComponent");

      // Update position first
      position.x += velocity.x * deltaTime;
      position.y += velocity.y * deltaTime;

      const acceleration = em.getComponent(entity, "AccelerationComponent");
      if (acceleration) {
        velocity.x += acceleration.x * deltaTime;
        velocity.y += acceleration.y * deltaTime;
      }

      const friction = em.getComponent(entity, "FrictionComponent");
      if (friction) {
        velocity.x *= Math.pow(friction.x, deltaTime);
        velocity.y *= Math.pow(friction.y, deltaTime);
      }

      const gravityFactor = em.getComponent(entity, "GravityFactorComponent");
      if (gravityFactor) {
        velocity.y += 9.81 * gravityFactor.value * deltaTime;
      }

      const canvasWidth = this.viewport.canvas.width;
      const offset = em.getComponent(entity, "OffsetComponent") ?? { x: 0, y: 0 };
      const bounciness = em.getComponent(entity, "BouncinessComponent");

      // Handle collisions with the walls
      if (position.x + offset.x < 0) {
        position.x = -offset.x;
        // bounciness
        if (bounciness) velocity.x = -velocity.x * bounciness.bounce;
        if (Math.abs(velocity.x) < bounciness.minVelocity) {
          velocity.x = 0;
        }
      }

      if (position.x + offset.x + size.x > canvasWidth) {
        position.x = canvasWidth - size.x - offset.x;
        if (bounciness) velocity.x = -velocity.x * bounciness.bounce;
        if (Math.abs(velocity.x) < bounciness.minVelocity) {
          velocity.x = 0;
        }
      }

      if (position.y + offset.y < 0) {
        position.y = -offset.y;
        if (bounciness) velocity.y = -velocity.y * bounciness.bounce;
        if (Math.abs(velocity.y) < bounciness.minVelocity) {
          velocity.y = 0;
        }
      }

      if (position.y + offset.y + size.y > canvasWidth) {
        position.y = canvasWidth - size.y - offset.y;
        if (bounciness) velocity.y = -velocity.y * bounciness.bounce;
        if (Math.abs(velocity.y) < bounciness.minVelocity) {
          velocity.y = 0;
        }
      }
    }
  }
}
