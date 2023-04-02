import { Viewport } from "../graphics/viewport.js";
import { Guard } from "../utils/guard.js";
import { SystemTypes } from "./system-types.js";
import { System } from "./system.js";

export class PhysicsSystem extends System {
  static requiredComponents = ["Position", "Velocity", "Size"];
  static systemType = SystemTypes.Physics;

  /** @type {Viewport} */
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
      const position = em.getComponent(entity, "Position");
      const velocity = em.getComponent(entity, "Velocity");

      // Update position first
      position.x += velocity.x * deltaTime;
      position.y += velocity.y * deltaTime;

      const acceleration = em.getComponent(entity, "Acceleration");
      if (acceleration) {
        velocity.x += acceleration.x * deltaTime;
        velocity.y += acceleration.y * deltaTime;
      }

      const friction = em.getComponent(entity, "Friction");
      if (friction) {
        velocity.x *= Math.pow(friction.x, deltaTime);
        velocity.y *= Math.pow(friction.y, deltaTime);
      }

      const gravityFactor = em.getComponent(entity, "GravityFactor");
      if (gravityFactor) {
        velocity.y += 9.81 * gravityFactor.value * deltaTime;
      }

      this.constrainToViewportDimensions(entity, position, velocity);
    }
  }

  /**
   * @param {number} entity entity identifier
   * @param {import("../components/position.js").Position} position position component
   * @param {import("../components/velocity.js").Velocity} velocity velocity component
   */
  constrainToViewportDimensions(entity, position, velocity) {
    const canvasWidth = this.viewport.canvas.width;
    const offset = this.entityManager.getComponent(entity, "Offset") ?? { x: 0, y: 0 };
    const bounciness = this.entityManager.getComponent(entity, "Bounciness");
    const size = this.entityManager.getComponent(entity, "Size");
    const absVelX = Math.abs(velocity.x);
    const absVelY = Math.abs(velocity.y);

    // Handle collisions with the walls
    if (position.x + offset.x < 0) {
      position.x = -offset.x;
      if (bounciness) velocity.x = -velocity.x * bounciness.bounce;
      if (absVelX < bounciness.minVelocity) {
        velocity.x = 0;
      }
    }

    if (position.x + offset.x + size.x > canvasWidth) {
      position.x = canvasWidth - size.x - offset.x;
      if (bounciness) velocity.x = -velocity.x * bounciness.bounce;
      if (absVelX < bounciness.minVelocity) {
        velocity.x = 0;
      }
    }

    if (position.y + offset.y < 0) {
      position.y = -offset.y;
      if (bounciness) velocity.y = -velocity.y * bounciness.bounce;
      if (absVelY < bounciness.minVelocity) {
        velocity.y = 0;
      }
    }

    if (position.y + offset.y + size.y > canvasWidth) {
      position.y = canvasWidth - size.y - offset.y;
      if (bounciness) velocity.y = -velocity.y * bounciness.bounce;
      if (absVelY < bounciness.minVelocity) {
        velocity.y = 0;
      }
    }
  }
}
