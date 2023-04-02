import { CollisionTypes } from "../components/collision.js";
import { SystemTypes } from "./system-types.js";
import { System } from "./system.js";

export class CollisionSystem extends System {
  static requiredComponents = ["Position", "Size", "Collision"];
  static systemType = SystemTypes.Collision;

  constructor(entityManager) {
    super(entityManager);
  }

  update() {
    const em = this.entityManager;
    const entities = em.getEntitiesWithComponents(...CollisionSystem.requiredComponents);
    for (const entity of entities) {
      const collision = em.getComponent(entity, "Collision") ?? {
        constrainWithinViewport: false,
        entityCollisionType: CollisionTypes.None,
      };
      const position = em.getComponent(entity, "Position");
      const velocity = em.getComponent(entity, "Velocity");

      if (collision.constrainWithinViewport) {
        this.constrainToViewportDimensions(entity, position, velocity);
      }

      if (collision.entityCollisionType !== CollisionTypes.None) {
        /** empty */
      }
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
