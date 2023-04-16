import { Position, Size } from "../components/index.js";
import { EntityManager } from "../entities/entity-manager.js";
import { Viewport } from "../graphics/viewport.js";
import { Assert } from "../utils/assert.js";
import { DetectionResult, Key, ViewportCollision } from "../utils/types.js";

const SIDES = { LEFT: 0, TOP: 1, RIGHT: 2, BOTTOM: 3 } as const;
type Side = typeof SIDES[Key<typeof SIDES>];

export class CollisionResolver {
  entityManager: EntityManager;
  viewport: Viewport;

  constructor(entityManager: EntityManager, viewport: Viewport) {
    Assert.instanceOf("entityManager", entityManager, EntityManager);
    Assert.instanceOf("viewport", viewport, Viewport);
    this.entityManager = entityManager;
    this.viewport = viewport;
  }

  resolve(collided: DetectionResult): void {
    this.#resolveViewportCollisions(collided.viewportCollisions);
    collided.entityCollisions.forEach((v) => {
      const [a, b] = v;
      this.resolvePair(a, b);
    });
  }

  resolvePair(a: number, b: number): void {
    const em = this.entityManager;

    // Get components
    const posA = em.getComponent(a, "Position")!;
    const posB = em.getComponent(b, "Position")!;
    const velA = em.getComponent(a, "Velocity")!;
    const velB = em.getComponent(b, "Velocity")!;
    const sizeA = em.getComponent(a, "Size")!;
    const sizeB = em.getComponent(b, "Size")!;
    const collisionA = em.getComponent(a, "Collision")!;
    const collisionB = em.getComponent(b, "Collision")!;

    const bDefault = { value: 1 };
    const bounceA = em.getComponent(a, "Bounciness") ?? bDefault;
    const bounceB = em.getComponent(b, "Bounciness") ?? bDefault;

    const side = this.#findSide(posA, sizeA, posB, sizeB);
    switch (side) {
      case SIDES.LEFT:
        {
          const overlap = posA.x + sizeA.x - posB.x;
          if (overlap < 0) break;

          if (collisionA.hasEntityCollisionType("BOUNCE")) {
            if (collisionB.hasEntityCollisionType("BOUNCE")) {
              posA.x -= overlap;
              posB.x += overlap;
              const vRel = velA.x - velB.x;
              velA.x = -vRel * bounceA.value + velA.x;
              velB.x = vRel * bounceB.value + velB.x;
            }

            if (collisionB.hasEntityCollisionType("WALL")) {
              posA.x -= overlap * 2;
              velA.x *= -bounceA.value;
            }
          }

          if (collisionA.hasEntityCollisionType("WALL")) {
            if (collisionB.hasEntityCollisionType("BOUNCE")) {
              posB.x += overlap * 2;
              velB.x *= -bounceB.value;
            }
          }
        }
        break;
      case SIDES.RIGHT:
        {
          const overlap = posB.x + sizeB.x - posA.x;
          if (overlap < 0) break;

          if (collisionA.hasEntityCollisionType("BOUNCE")) {
            if (collisionB.hasEntityCollisionType("BOUNCE")) {
              posA.x += overlap;
              posB.x -= overlap;
              const vRel = velA.x - velB.x;
              velA.x = -vRel * bounceA.value + velA.x;
              velB.x = vRel * bounceB.value + velB.x;
            }

            if (collisionB.hasEntityCollisionType("WALL")) {
              posA.x += overlap * 2;
              velA.x *= -bounceA.value;
            }
          }

          if (collisionA.hasEntityCollisionType("WALL")) {
            if (collisionB.hasEntityCollisionType("BOUNCE")) {
              posB.x -= overlap * 2;
              velB.x *= -bounceB.value;
            }
          }
        }
        break;
      case SIDES.TOP:
        {
          const overlap = posA.y + sizeA.y - posB.y;
          if (overlap < 0) break;

          if (collisionA.hasEntityCollisionType("BOUNCE")) {
            if (collisionB.hasEntityCollisionType("BOUNCE")) {
              posA.y -= overlap;
              posB.y += overlap;
              const vRel = velA.y - velB.y;
              velA.y = -vRel * bounceA.value + velA.y;
              velB.y = vRel * bounceB.value + velB.y;
            }

            if (collisionB.hasEntityCollisionType("WALL")) {
              posA.y -= overlap * 2;
              velA.y *= -bounceA.value;
            }
          }

          if (collisionA.hasEntityCollisionType("WALL")) {
            if (collisionB.hasEntityCollisionType("BOUNCE")) {
              posB.y += overlap * 2;
              velB.y *= -bounceB.value;
            }
          }
        }
        break;
      case SIDES.BOTTOM:
        {
          const overlap = posB.y + sizeB.y - posA.y;
          if (overlap < 0) break;

          if (collisionA.hasEntityCollisionType("BOUNCE")) {
            if (collisionB.hasEntityCollisionType("BOUNCE")) {
              posA.y += overlap;
              posB.y -= overlap;
              const vRel = velA.y - velB.y;
              velA.y = -vRel * bounceA.value + velA.y;
              velB.y = vRel * bounceB.value + velB.y;
            }

            if (collisionB.hasEntityCollisionType("WALL")) {
              posA.y += overlap * 2;
              velA.y *= -bounceA.value;
            }
          }

          if (collisionA.hasEntityCollisionType("WALL")) {
            if (collisionB.hasEntityCollisionType("BOUNCE")) {
              posB.y -= overlap * 2;
              velB.y *= -bounceB.value;
            }
          }
        }
        break;
      default:
        break;
    }
  }

  #findSide(posA: Position, sizeA: Size, posB: Position, sizeB: Size): Side {
    // Get midpoints
    const aMidX = posA.x + sizeA.halfX;
    const aMidY = posA.y + sizeA.halfY;
    const bMidX = posB.x + sizeB.halfX;
    const bMidY = posB.y + sizeB.halfY;

    // Find side of entry based on the normalized sides
    const dx = (aMidX - bMidX) / (sizeA.halfX + sizeB.halfX);
    const dy = (aMidY - bMidY) / (sizeA.halfY + sizeB.halfY);
    const absDX = Math.abs(dx);
    const absDY = Math.abs(dy);

    if (absDX > absDY) {
      return dx > 0 ? SIDES.RIGHT : SIDES.LEFT;
    }
    return dy > 0 ? SIDES.BOTTOM : SIDES.TOP;
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
