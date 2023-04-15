import { Bounciness } from "../components/index.js";
import { EntityManager } from "../entities/entity-manager.js";
import { Viewport } from "../graphics/viewport.js";
import { Assert } from "../utils/assert.js";
import { DetectionResult } from "../utils/types.js";

const sides = { LEFT: 0, TOP: 1, RIGHT: 2, BOTTOM: 3 } as const;

export class CollisionResolver {
  entityManager: EntityManager;
  viewport: Viewport;

  static defaultComponents = {
    bounce: new Bounciness(1),
  };

  constructor(entityManager: EntityManager, viewport: Viewport) {
    Assert.instanceOf("entityManager", entityManager, EntityManager);
    Assert.instanceOf("viewport", viewport, Viewport);
    this.entityManager = entityManager;
    this.viewport = viewport;
  }

  resolve(collided: DetectionResult) {
    const em = this.entityManager;
    collided.viewportCollisions.forEach((v) => {
      const [entity, viewportCollisions] = v;
      const pos = em.getComponent(entity, "Position")!;
      const size = em.getComponent(entity, "Size")!;
      const vel = em.getComponent(entity, "Velocity")!;

      const collision = em.getComponent(entity, "Collision")!;
      const bounceEnabled = collision.hasEntityCollisionType("BOUNCE");
      const defaultBounce = CollisionResolver.defaultComponents.bounce;
      const bounce = em.getComponent(entity, "Bounciness") ?? defaultBounce;

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
    collided.entityCollisions.forEach((v) => {
      const [a, b] = v;
      // Get components
      const posA = em.getComponent(a, "Position")!;
      const posB = em.getComponent(b, "Position")!;
      const velA = em.getComponent(a, "Velocity")!;
      const velB = em.getComponent(b, "Velocity")!;
      const sizeA = em.getComponent(a, "Size")!;
      const sizeB = em.getComponent(b, "Size")!;
      const collisionA = em.getComponent(a, "Collision")!;
      const collisionB = em.getComponent(b, "Collision")!;

      const bDefault = CollisionResolver.defaultComponents.bounce;
      const bounceA = em.getComponent(a, "Bounciness") ?? bDefault;
      const bounceB = em.getComponent(b, "Bounciness") ?? bDefault;
      const aHasBounceFlag = collisionA.hasEntityCollisionType("BOUNCE");
      const bHasBounceFlag = collisionB.hasEntityCollisionType("BOUNCE");

      // Get midpoints
      const aMidX = posA.x + sizeA.halfX;
      const aMidY = posA.y + sizeA.halfY;
      const bMidX = posB.x + sizeB.halfX;
      const bMidY = posB.y + sizeB.halfY;

      // Find side of entry based on the normalized sides
      const dx = (aMidX - bMidX) / (sizeA.halfX + sizeB.halfX);
      const dy = (aMidY - bMidY) / (sizeA.halfY + sizeB.halfY);
      // Calculate the absolute differences in the x and y coordinates
      const absDX = Math.abs(dx);
      const absDY = Math.abs(dy);

      /** The side of A that was collided with. */
      let side: typeof sides[keyof typeof sides];
      if (absDX > absDY) side = dx > 0 ? sides.RIGHT : sides.LEFT;
      else side = dy > 0 ? sides.BOTTOM : sides.TOP;
      switch (side) {
        case sides.LEFT:
          {
            const overlap = posA.x + sizeA.x - posB.x;
            if (overlap < 0) break;

            if (aHasBounceFlag && bHasBounceFlag) {
              posA.x -= overlap;
              posB.x += overlap;
              const vRel = velA.x - velB.x;
              velA.x = -vRel * bounceA.value + velA.x;
              velB.x = vRel * bounceB.value + velB.x;
            } else if (aHasBounceFlag) {
              posA.x -= overlap * 2;
              velA.x *= -bounceA.value;
            } else {
              posB.x += overlap * 2;
              velB.x *= -bounceB.value;
            }
          }
          break;
        case sides.RIGHT:
          {
            const overlap = posB.x + sizeB.x - posA.x;
            if (overlap < 0) break;

            if (aHasBounceFlag && bHasBounceFlag) {
              posA.x += overlap;
              posB.x -= overlap;
              const vRel = velA.x - velB.x;
              velA.x = -vRel * bounceA.value + velA.x;
              velB.x = vRel * bounceB.value + velB.x;
            } else if (aHasBounceFlag) {
              posA.x += overlap * 2;
              velA.x *= -bounceA.value;
            } else {
              posB.x -= overlap * 2;
              velB.x *= -bounceB.value;
            }
          }
          break;
        case sides.TOP:
          {
            const overlap = posA.y + sizeA.y - posB.y;
            if (overlap < 0) break;

            if (aHasBounceFlag && bHasBounceFlag) {
              posA.y -= overlap;
              posB.y += overlap;
              const vRel = velA.y - velB.y;
              velA.y = -vRel * bounceA.value + velA.y;
              velB.y = vRel * bounceB.value + velB.y;
            } else if (aHasBounceFlag) {
              posA.y -= overlap * 2;
              velA.y *= -bounceA.value;
            } else {
              posB.y += overlap * 2;
              velB.y *= -bounceB.value;
            }
          }
          break;
        case sides.BOTTOM:
          {
            const overlap = posB.y + sizeB.y - posA.y;
            if (overlap < 0) break;

            if (aHasBounceFlag && bHasBounceFlag) {
              posA.y += overlap;
              posB.y -= overlap;
              const vRel = velA.y - velB.y;
              velA.y = -vRel * bounceA.value + velA.y;
              velB.y = vRel * bounceB.value + velB.y;
            } else if (aHasBounceFlag) {
              posA.y += overlap * 2;
              velA.y *= -bounceA.value;
            } else {
              posB.y -= overlap * 2;
              velB.y *= -bounceB.value;
            }
          }
          break;
        default:
          break;
      }
    });
  }
}
