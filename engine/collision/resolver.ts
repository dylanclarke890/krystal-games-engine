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
type ResolverComponents = DefinedExcept<
  ComponentMap<RequiredComponents | OptionalComponents>,
  OptionalComponents
>;

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
    ) as ResolverComponents;
    if (!a.Bounciness) a.Bounciness = defaultComponents.bounce;
    if (!a.Mass) a.Mass = defaultComponents.mass;

    const b = em.getComponents(
      entityB,
      "Position",
      "Velocity",
      "Size",
      "Collision",
      "Bounciness",
      "Mass"
    ) as ResolverComponents;
    if (!b.Bounciness) b.Bounciness = defaultComponents.bounce;
    if (!b.Mass) b.Mass = defaultComponents.mass;

    const side = this.#findSideOfCollision(a, b);
    const totalBounciness = a.Bounciness.value * b.Bounciness.value;

    if (totalBounciness === 1) {
      this.#resolvePerfectlyElastic(a, b, side);
    } else if (totalBounciness === 0) {
      this.#resolvePerfectlyInelastic(a, b, side);
    } else {
      this.#resolveInelastic(a, b, side);
    }
  }

  #findSideOfCollision(a: ResolverComponents, b: ResolverComponents): Side {
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

  #calculateElasticImpulses(vA: number, vB: number, mA: number, mB: number): [number, number] {
    if (mA === mB) {
      // perfectly elastic, return the opposite speeds
      return [vB, vA];
    }
    const relativeVelocity = vA - vB;
    const totalMass = mA + mB;
    const impulse = (2 * mA * mB * relativeVelocity) / totalMass;
    
    vA -= impulse * (mB / totalMass);
    vB += impulse * (mA / totalMass);

    return [vA, vB];
  }

  #resolvePerfectlyElastic(a: ResolverComponents, b: ResolverComponents, side: Side): void {
    switch (side) {
      case SIDES.LEFT:
        {
          const overlap = a.Position.x + a.Size.x - b.Position.x;
          if (overlap < 0) break;
          if (a.Collision.hasEntityCollisionType("BOUNCE")) {
            if (b.Collision.hasEntityCollisionType("BOUNCE")) {
              a.Position.x -= overlap;
              b.Position.x += overlap;

              const [velA, velB] = this.#calculateElasticImpulses(
                a.Velocity.x,
                b.Velocity.x,
                a.Mass!.value,
                b.Mass!.value
              );

              a.Velocity.x = velA;
              b.Velocity.x = velB;
            } else if (b.Collision.hasEntityCollisionType("RIGID")) {
              a.Position.x -= overlap * 2;
              a.Velocity.x *= -a.Bounciness!.value;
            }
          } else if (a.Collision.hasEntityCollisionType("RIGID")) {
            if (b.Collision.hasEntityCollisionType("BOUNCE")) {
              b.Position.x += overlap * 2;
              b.Velocity.x *= -b.Bounciness!.value;
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

              const [velA, velB] = this.#calculateElasticImpulses(
                a.Velocity.x,
                b.Velocity.x,
                b.Mass!.value,
                a.Mass!.value
              );

              a.Velocity.x = velA;
              b.Velocity.x = velB;
            } else if (b.Collision.hasEntityCollisionType("RIGID")) {
              a.Position.x += overlap * 2;
              a.Velocity.x *= -a.Bounciness!.value;
            }
          } else if (a.Collision.hasEntityCollisionType("RIGID")) {
            if (b.Collision.hasEntityCollisionType("BOUNCE")) {
              b.Position.x -= overlap * 2;
              b.Velocity.x *= -b.Bounciness!.value;
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

              const [impulseA, impulseB] = this.#calculateElasticImpulses(
                a.Velocity.y,
                b.Velocity.y,
                b.Mass!.value,
                a.Mass!.value
              );

              a.Velocity.y += impulseA;
              b.Velocity.y -= impulseB;
            } else if (b.Collision.hasEntityCollisionType("RIGID")) {
              a.Position.y -= overlap * 2;
              a.Velocity.y *= -a.Bounciness!.value;
            }
          } else if (a.Collision.hasEntityCollisionType("RIGID")) {
            if (b.Collision.hasEntityCollisionType("BOUNCE")) {
              b.Position.y += overlap * 2;
              b.Velocity.y *= -b.Bounciness!.value;
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

              const [impulseA, impulseB] = this.#calculateElasticImpulses(
                a.Velocity.y,
                b.Velocity.y,
                b.Mass!.value,
                a.Mass!.value
              );

              a.Velocity.y -= impulseA;
              b.Velocity.y += impulseB;
            } else if (b.Collision.hasEntityCollisionType("RIGID")) {
              a.Position.y += overlap * 2;
              a.Velocity.y *= -a.Bounciness!.value;
            }
          } else if (a.Collision.hasEntityCollisionType("RIGID")) {
            if (b.Collision.hasEntityCollisionType("BOUNCE")) {
              b.Position.y -= overlap * 2;
              b.Velocity.y *= -b.Bounciness!.value;
            }
          }
        }
        break;
      default:
        break;
    }
  }

  #resolvePerfectlyInelastic(a: ResolverComponents, b: ResolverComponents, side: Side): void {
    switch (side) {
      case SIDES.LEFT:
        console.log(a, b);
        break;
      case SIDES.RIGHT:
        break;
      case SIDES.TOP:
        break;
      case SIDES.BOTTOM:
        break;
      default:
        break;
    }
  }

  #resolveInelastic(a: ResolverComponents, b: ResolverComponents, side: Side): void {
    switch (side) {
      case SIDES.LEFT:
        {
          const overlap = a.Position.x + a.Size.x - b.Position.x;
          if (overlap < 0) break;
          if (a.Collision.hasEntityCollisionType("BOUNCE")) {
            if (b.Collision.hasEntityCollisionType("BOUNCE")) {
              a.Position.x -= overlap;
              b.Position.x += overlap;
              const vRel = a.Velocity.x - b.Velocity.x;
              a.Velocity.x = -vRel * a.Bounciness!.value + a.Velocity.x;
              b.Velocity.x = vRel * b.Bounciness!.value + b.Velocity.x;
            }

            if (b.Collision.hasEntityCollisionType("RIGID")) {
              a.Position.x -= overlap * 2;
              a.Velocity.x *= -a.Bounciness!.value;
            }
          }

          if (a.Collision.hasEntityCollisionType("RIGID")) {
            if (b.Collision.hasEntityCollisionType("BOUNCE")) {
              b.Position.x += overlap * 2;
              b.Velocity.x *= -b.Bounciness!.value;
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
              const impulse =
                ((1 + a.Bounciness!.value * b.Bounciness!.value) * vRel) /
                (1 / a.Mass!.value + 1 / b.Mass!.value);
              a.Velocity.x = impulse / a.Mass!.value;
              b.Velocity.x = impulse / b.Mass!.value;
            }

            if (b.Collision.hasEntityCollisionType("RIGID")) {
              a.Position.x += overlap * 2;
              a.Velocity.x *= -a.Bounciness!.value;
            }
          }

          if (a.Collision.hasEntityCollisionType("RIGID")) {
            if (b.Collision.hasEntityCollisionType("BOUNCE")) {
              b.Position.x -= overlap * 2;
              b.Velocity.x *= -b.Bounciness!.value;
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
              a.Velocity.y = -vRel * a.Bounciness!.value + a.Velocity.y;
              b.Velocity.y = vRel * b.Bounciness!.value + b.Velocity.y;
            }

            if (b.Collision.hasEntityCollisionType("RIGID")) {
              a.Position.y -= overlap * 2;
              a.Velocity.y *= -a.Bounciness!.value;
            }
          }

          if (a.Collision.hasEntityCollisionType("RIGID")) {
            if (b.Collision.hasEntityCollisionType("BOUNCE")) {
              b.Position.y += overlap * 2;
              b.Velocity.y *= -b.Bounciness!.value;
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
              a.Velocity.y = -vRel * a.Bounciness!.value + a.Velocity.y;
              b.Velocity.y = vRel * b.Bounciness!.value + b.Velocity.y;
            }

            if (b.Collision.hasEntityCollisionType("RIGID")) {
              a.Position.y += overlap * 2;
              a.Velocity.y *= -a.Bounciness!.value;
            }
          }

          if (a.Collision.hasEntityCollisionType("RIGID")) {
            if (b.Collision.hasEntityCollisionType("BOUNCE")) {
              b.Position.y -= overlap * 2;
              b.Velocity.y *= -b.Bounciness!.value;
            }
          }
        }
        break;
      default:
        break;
    }
  }

  // TODO: we're bouncing, do we need to apply impulse here? (probably)
  #resolveViewportCollisions(collisions: ViewportCollision[]): void {
    const em = this.entityManager;
    collisions.forEach((v) => {
      const [id, viewportCollisions] = v;
      const entity = em.getComponents(
        id,
        "Position",
        "Velocity",
        "Size",
        "Collision",
        "Bounciness",
        "Mass"
      ) as ResolverComponents;

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
