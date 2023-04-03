import { Guard } from "../utils/guard.js";
import { SystemTypes } from "./system-types.js";
import { System } from "./system.js";
import { Viewport } from "../graphics/viewport.js";
import { EventSystem } from "../events/event-system.js";

export class CollisionSystem extends System {
  static requiredComponents = ["Position", "Size", "Collision"];
  static systemType = SystemTypes.Collision;

  /** @type {Viewport} */
  viewport;
  /** @type {Function} */
  entityCollisionCheck;

  /**
   *
   * @param {import("../entities/entity-manager.js").EntityManager} entityManager
   * @param {Viewport} viewport
   * @param {EventSystem} eventSystem
   * @param {CollisionStrategy} entityCollisionStrategy
   */
  constructor(entityManager, viewport, eventSystem, entityCollisionStrategy) {
    super(entityManager);
    Guard.againstNull({ viewport }).isInstanceOf(Viewport);
    Guard.againstNull({ eventSystem }).isInstanceOf(EventSystem);
    Guard.againstNull({ entityCollisionStrategy }).isTypeOf("function");
    this.viewport = viewport;
    this.eventSystem = eventSystem;
    this.entityCollisionCheck = entityCollisionStrategy;
  }

  update() {
    const em = this.entityManager;
    const entities = em.getEntitiesWithComponents(...CollisionSystem.requiredComponents);
    const checked = new Set();
    for (let i = 0; i < entities.length; i++) {
      const entityA = entities[i];
      const collisionA = em.getComponent(entityA, "Collision");
      const posA = em.getComponent(entityA, "Position");
      const velocity = em.getComponent(entityA, "Velocity") ?? { x: 0, y: 0 };

      this.constrainToViewportDimensions(entityA, collisionA.viewportCollision, posA, velocity);
      if (!collisionA.entityCollision.enabled || checked.has(entityA)) continue;
      const sizeA = em.getComponent(entityA, "Size");

      for (let j = 0; j < entities.length; j++) {
        const entityB = entities[j];
        const collisionB = em.getComponent(entityB, "Collision");
        if (entityA === entityB || !collisionB.entityCollision.enabled || checked.has(entityB)) {
          continue;
        }
        const posB = em.getComponent(entityB, "Position");
        const sizeB = em.getComponent(entityB, "Size");
        if (this.entityCollisionCheck(posA, sizeA, posB, sizeB, em)) {
          this.handleEntityCollision(entityA, entityB);
        }
      }
      checked.add(entityA);
    }
  }

  handleEntityCollision(entityA, entityB) {
    console.log(entityA, entityB);
  }

  /**
   * @param {number} entity entity identifier
   * @param {import("../components/position.js").Position} collision collision component
   * @param {import("../components/position.js").Position} position position component
   * @param {import("../components/velocity.js").Velocity} velocity velocity component
   */
  constrainToViewportDimensions(entity, viewportCollision, position, velocity) {
    const canvasWidth = this.viewport.canvas.width;
    const canvasHeight = this.viewport.canvas.height;
    const offset = this.entityManager.getComponent(entity, "Offset") ?? { x: 0, y: 0 };
    const bounciness = this.entityManager.getComponent(entity, "Bounciness");
    const size = this.entityManager.getComponent(entity, "Size");
    const absVelX = bounciness ? Math.abs(velocity.x) : 0;
    const absVelY = bounciness ? Math.abs(velocity.y) : 0;

    if (viewportCollision.left && position.x + offset.x < 0) {
      position.x = -offset.x;
      if (bounciness) {
        velocity.x = -velocity.x * bounciness.bounce;
        if (absVelX < bounciness.minVelocity) {
          velocity.x = 0;
        }
      }
    }

    if (viewportCollision.right && position.x + offset.x + size.x > canvasWidth) {
      position.x = canvasWidth - size.x - offset.x;
      if (bounciness) {
        velocity.x = -velocity.x * bounciness.bounce;
        if (absVelX < bounciness.minVelocity) {
          velocity.x = 0;
        }
      }
    }

    if (viewportCollision.bottom && position.y + offset.y < 0) {
      position.y = -offset.y;
      if (bounciness) {
        velocity.y = -velocity.y * bounciness.bounce;
        if (absVelY < bounciness.minVelocity) {
          velocity.y = 0;
        }
      }
    }

    if (viewportCollision.top && position.y + offset.y + size.y > canvasHeight) {
      position.y = canvasHeight - size.y - offset.y;
      if (bounciness) {
        velocity.y = -velocity.y * bounciness.bounce;
        if (absVelY < bounciness.minVelocity) {
          velocity.y = 0;
        }
      }
    }
  }
}
