import { EntityManager } from "../entities/entity-manager.js";
import { Viewport } from "../graphics/viewport.js";
import { Assert } from "../utils/assert.js";
import { DetectionResult, ViewportCollision } from "../utils/types.js";
import { DefaultCollisionStrategy } from "./strategies.js";

export class CollisionResolver {
  entityManager: EntityManager;
  viewport: Viewport;
  collisionStrategies;

  constructor(entityManager: EntityManager, viewport: Viewport) {
    Assert.instanceOf("entityManager", entityManager, EntityManager);
    Assert.instanceOf("viewport", viewport, Viewport);
    this.entityManager = entityManager;
    this.viewport = viewport;
    this.collisionStrategies = {
      default: new DefaultCollisionStrategy(entityManager),
    };
  }

  resolve(collided: DetectionResult) {
    this.#resolveViewportCollisions(collided.viewportCollisions);
    collided.entityCollisions.forEach((v) => {
      const [a, b] = v;
      this.collisionStrategies.default.resolve(a, b);
    });
  }

  #resolveViewportCollisions(collisions: ViewportCollision[]) {
    const em = this.entityManager;
    collisions.forEach((v) => {
      const [entity, viewportCollisions] = v;
      const pos = em.getComponent(entity, "Position")!;
      const size = em.getComponent(entity, "Size")!;
      const vel = em.getComponent(entity, "Velocity")!;

      const collision = em.getComponent(entity, "Collision")!;
      const bounceEnabled = collision.hasEntityCollisionType("BOUNCE");
      const bounce = em.getComponent(entity, "Bounciness") ?? { value: 1 };

      if (viewportCollisions.left) {
        pos.x = 0;
        if (bounceEnabled) {
          vel.x = -vel.x * bounce.value;
        }
      }
      if (viewportCollisions.right) {
        pos.x = this.viewport.width - size.x;
        if (bounceEnabled) {
          vel.x = -vel.x * bounce.value;
        }
      }
      if (viewportCollisions.top) {
        pos.y = 0;
        if (bounceEnabled) {
          vel.y = -vel.y * bounce.value;
        }
      }
      if (viewportCollisions.bottom) {
        pos.y = this.viewport.height - size.y;
        if (bounceEnabled) {
          vel.y = -vel.y * bounce.value;
        }
      }
    });
  }
}
