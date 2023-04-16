import { Bounciness } from "../components/bounciness.js";
import { EntityManager } from "../entities/entity-manager.js";
import { Viewport } from "../graphics/viewport.js";
import { Assert } from "../utils/assert.js";
import {
  ComponentMap,
  DefinedExcept,
  DetectionResult,
  Key,
  ViewportCollision,
} from "../utils/types.js";

const SIDES = { LEFT: 0, TOP: 1, RIGHT: 2, BOTTOM: 3 } as const;
type Side = typeof SIDES[Key<typeof SIDES>];
type ResolverComponents = "Position" | "Velocity" | "Size" | "Collision" | "Bounciness";

const defaultComponents = {
  bounce: new Bounciness(1),
};

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

  resolvePair(entityA: number, entityB: number): void {
    const em = this.entityManager;

    const a = em.getComponents(
      entityA,
      "Position",
      "Velocity",
      "Size",
      "Collision",
      "Bounciness"
    ) as DefinedExcept<ComponentMap<ResolverComponents>, "Bounciness">;
    if (!a.Bounciness) a.Bounciness = defaultComponents.bounce;

    const b = em.getComponents(
      entityB,
      "Position",
      "Velocity",
      "Size",
      "Collision",
      "Bounciness"
    ) as DefinedExcept<ComponentMap<ResolverComponents>, "Bounciness">;
    if (!b.Bounciness) b.Bounciness = defaultComponents.bounce;

    const side = this.#findSideOfCollision(a, b);
    switch (side) {
      case SIDES.LEFT:
        {
          const overlap = a.Position.x + a.Size.x - a.Position.x;
          if (overlap < 0) break;

          if (a.Collision.hasEntityCollisionType("BOUNCE")) {
            if (b.Collision.hasEntityCollisionType("BOUNCE")) {
              a.Position.x -= overlap;
              b.Position.x += overlap;
              const vRel = a.Velocity.x - b.Velocity.x;
              a.Velocity.x = -vRel * a.Bounciness.value + a.Velocity.x;
              b.Velocity.x = vRel * b.Bounciness.value + b.Velocity.x;
            }

            if (b.Collision.hasEntityCollisionType("RIGID")) {
              a.Position.x -= overlap * 2;
              a.Velocity.x *= -a.Bounciness.value;
            }
          }

          if (a.Collision.hasEntityCollisionType("RIGID")) {
            if (b.Collision.hasEntityCollisionType("BOUNCE")) {
              b.Position.x += overlap * 2;
              b.Velocity.x *= -b.Bounciness.value;
            }
          }
        }
        break;
      case SIDES.RIGHT:
        {
          const overlap = b.Position.x + b.Size.x - a.Position.x;
          if (overlap < 0) break;

          if (a.Collision.hasEntityCollisionType("BOUNCE")) {
            if (b.Collision.hasEntityCollisionType("BOUNCE")) {
              a.Position.x += overlap;
              b.Position.x -= overlap;
              const vRel = a.Velocity.x - b.Velocity.x;
              a.Velocity.x = -vRel * a.Bounciness.value + a.Velocity.x;
              b.Velocity.x = vRel * b.Bounciness.value + b.Velocity.x;
            }

            if (b.Collision.hasEntityCollisionType("RIGID")) {
              a.Position.x += overlap * 2;
              a.Velocity.x *= -a.Bounciness.value;
            }
          }

          if (a.Collision.hasEntityCollisionType("RIGID")) {
            if (b.Collision.hasEntityCollisionType("BOUNCE")) {
              b.Position.x -= overlap * 2;
              b.Velocity.x *= -b.Bounciness.value;
            }
          }
        }
        break;
      case SIDES.TOP:
        {
          const overlap = a.Position.y + a.Size.y - b.Position.y;
          if (overlap < 0) break;

          if (a.Collision.hasEntityCollisionType("BOUNCE")) {
            if (b.Collision.hasEntityCollisionType("BOUNCE")) {
              a.Position.y -= overlap;
              b.Position.y += overlap;
              const vRel = a.Velocity.y - b.Velocity.y;
              a.Velocity.y = -vRel * a.Bounciness.value + a.Velocity.y;
              b.Velocity.y = vRel * b.Bounciness.value + b.Velocity.y;
            }

            if (b.Collision.hasEntityCollisionType("RIGID")) {
              a.Position.y -= overlap * 2;
              a.Velocity.y *= -a.Bounciness.value;
            }
          }

          if (a.Collision.hasEntityCollisionType("RIGID")) {
            if (b.Collision.hasEntityCollisionType("BOUNCE")) {
              b.Position.y += overlap * 2;
              b.Velocity.y *= -b.Bounciness.value;
            }
          }
        }
        break;
      case SIDES.BOTTOM:
        {
          const overlap = b.Position.y + b.Size.y - a.Position.y;
          if (overlap < 0) break;

          if (a.Collision.hasEntityCollisionType("BOUNCE")) {
            if (b.Collision.hasEntityCollisionType("BOUNCE")) {
              a.Position.y += overlap;
              b.Position.y -= overlap;
              const vRel = a.Velocity.y - b.Velocity.y;
              a.Velocity.y = -vRel * a.Bounciness.value + a.Velocity.y;
              b.Velocity.y = vRel * b.Bounciness.value + b.Velocity.y;
            }

            if (b.Collision.hasEntityCollisionType("RIGID")) {
              a.Position.y += overlap * 2;
              a.Velocity.y *= -a.Bounciness.value;
            }
          }

          if (a.Collision.hasEntityCollisionType("RIGID")) {
            if (b.Collision.hasEntityCollisionType("BOUNCE")) {
              b.Position.y -= overlap * 2;
              b.Velocity.y *= -b.Bounciness.value;
            }
          }
        }
        break;
      default:
        break;
    }
  }

  #findSideOfCollision(a: ComponentMap<any>, b: ComponentMap<any>): Side {
    // Get midpoints
    const aMidX = a.Position.x + a.Size.halfX;
    const aMidY = a.Position.y + a.Size.halfY;
    const bMidX = b.Position.x + b.Size.halfX;
    const bMidY = b.Position.y + b.Size.halfY;

    // Find side of entry based on the normalized sides
    const dx = (aMidX - bMidX) / (a.Size.halfX + b.Size.halfX);
    const dy = (aMidY - bMidY) / (a.Size.halfY + b.Size.halfY);
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
