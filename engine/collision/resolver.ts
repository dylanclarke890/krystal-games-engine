import { Bounciness } from "../components/bounciness.js";
import { Mass } from "../components/mass.js";
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
type RequiredComponents = "Position" | "Velocity" | "Size" | "Collision";
type OptionalComponents = "Bounciness" | "Mass";

const defaultComponents = {
  bounce: new Bounciness(1),
  mass: new Mass(1),
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
      "Bounciness",
      "Mass"
    ) as DefinedExcept<ComponentMap<RequiredComponents | OptionalComponents>, OptionalComponents>;
    if (!a.Bounciness) a.Bounciness = defaultComponents.bounce;
    if (!a.Mass) a.Mass = defaultComponents.mass;

    const b = em.getComponents(
      entityB,
      "Position",
      "Velocity",
      "Size",
      "Collision",
      "Bounciness"
    ) as DefinedExcept<ComponentMap<RequiredComponents | OptionalComponents>, OptionalComponents>;
    if (!b.Bounciness) b.Bounciness = defaultComponents.bounce;
    if (!b.Mass) b.Mass = defaultComponents.mass;

    const side = this.#findSideOfCollision(a, b);
    switch (side) {
      case SIDES.LEFT:
        {
          const overlap = a.Position.x + a.Size.x - b.Position.x;
          if (overlap < 0) break;

          if (a.Collision.hasEntityCollisionType("BOUNCE")) {
            if (b.Collision.hasEntityCollisionType("BOUNCE")) {
              const vRel = a.Velocity.x - b.Velocity.x;
              const impulse = ((2 * b.Mass.value) / (a.Mass.value + b.Mass.value)) * vRel;
              a.Velocity.x -= impulse * a.Bounciness.value;
              b.Velocity.x += impulse * b.Bounciness.value;
              a.Position.x -= overlap;
              b.Position.x += overlap;
            }

            if (b.Collision.hasEntityCollisionType("RIGID")) {
              const impulse = (2 * b.Mass.value * a.Velocity.x) / (a.Mass.value + b.Mass.value);
              a.Velocity.x = -impulse * a.Bounciness.value;
              a.Position.x -= overlap * 2;
            }
          }

          if (a.Collision.hasEntityCollisionType("RIGID")) {
            if (b.Collision.hasEntityCollisionType("BOUNCE")) {
              const impulse = (2 * a.Mass.value * b.Velocity.x) / (a.Mass.value + b.Mass.value);
              b.Velocity.x = impulse * b.Bounciness.value;
              b.Position.x += overlap * 2;
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
              const vRel = a.Velocity.x - b.Velocity.x;
              const impulse = ((2 * b.Mass.value) / (a.Mass.value + b.Mass.value)) * vRel;
              a.Velocity.x -= impulse * a.Bounciness.value;
              b.Velocity.x += impulse * b.Bounciness.value;
              a.Position.x += overlap;
              b.Position.x -= overlap;
            }

            if (b.Collision.hasEntityCollisionType("RIGID")) {
              const impulse = (2 * b.Mass.value * a.Velocity.x) / (a.Mass.value + b.Mass.value);
              a.Position.x += overlap * 2;
              a.Velocity.x = impulse * -a.Bounciness.value;
            }
          }

          if (a.Collision.hasEntityCollisionType("RIGID")) {
            if (b.Collision.hasEntityCollisionType("BOUNCE")) {
              const impulse = (2 * a.Mass.value * b.Velocity.x) / (a.Mass.value + b.Mass.value);
              b.Velocity.x = impulse * b.Bounciness.value;
              b.Position.x -= overlap * 2;
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
              const impulse = ((2 * b.Mass.value) / (a.Mass.value + b.Mass.value)) * vRel;

              a.Velocity.y -= impulse * a.Bounciness.value;
              b.Velocity.y += impulse * b.Bounciness.value;
            }

            if (b.Collision.hasEntityCollisionType("RIGID")) {
              a.Position.y -= overlap * 2;
              const impulse = (2 * b.Mass.value * a.Velocity.y) / (a.Mass.value + b.Mass.value);
              a.Velocity.y = -impulse * a.Bounciness.value;
            }
          }

          if (a.Collision.hasEntityCollisionType("RIGID")) {
            if (b.Collision.hasEntityCollisionType("BOUNCE")) {
              b.Position.y += overlap * 2;
              const impulse = (2 * a.Mass.value * b.Velocity.y) / (a.Mass.value + b.Mass.value);
              b.Velocity.y = impulse * b.Bounciness.value;
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
              const impulse = ((2 * b.Mass.value) / (a.Mass.value + b.Mass.value)) * vRel;
              a.Velocity.y -= impulse * a.Bounciness.value;
              b.Velocity.y += impulse * b.Bounciness.value;
            }

            if (b.Collision.hasEntityCollisionType("RIGID")) {
              a.Position.y += overlap * 2;
              a.Velocity.y *= -a.Bounciness.value;
            }
          }

          if (a.Collision.hasEntityCollisionType("RIGID")) {
            if (b.Collision.hasEntityCollisionType("BOUNCE")) {
              b.Position.y -= overlap * 2;
              const impulse = (2 * a.Mass.value * b.Velocity.y) / (a.Mass.value + b.Mass.value);
              b.Velocity.y = impulse * b.Bounciness.value;
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

  // TODO: we're bouncing, do we need to apply impulse here? (probably)
  #resolveViewportCollisions(collisions: ViewportCollision[]) {
    const em = this.entityManager;
    collisions.forEach((v) => {
      const [id, viewportCollisions] = v;
      const entity = em.getComponents(
        id,
        "Position",
        "Velocity",
        "Size",
        "Collision",
        "Bounciness"
      ) as DefinedExcept<ComponentMap<RequiredComponents | OptionalComponents>, OptionalComponents>;

      if (!entity.Bounciness) entity.Bounciness = defaultComponents.bounce;
      const bounceEnabled = entity.Collision.hasEntityCollisionType("BOUNCE");

      if (viewportCollisions.left) {
        entity.Position.x = 0;
        if (bounceEnabled) {
          entity.Velocity.x = -entity.Velocity.x * entity.Bounciness.value;
        }
      }
      if (viewportCollisions.right) {
        entity.Position.x = this.viewport.width - entity.Size.x;
        if (bounceEnabled) {
          entity.Velocity.x = -entity.Velocity.x * entity.Bounciness.value;
        }
      }
      if (viewportCollisions.top) {
        entity.Position.y = 0;
        if (bounceEnabled) {
          entity.Velocity.y = -entity.Velocity.y * entity.Bounciness.value;
        }
      }
      if (viewportCollisions.bottom) {
        entity.Position.y = this.viewport.height - entity.Size.y;
        if (bounceEnabled) {
          entity.Velocity.y = -entity.Velocity.y * entity.Bounciness.value;
        }
      }
    });
  }
}
