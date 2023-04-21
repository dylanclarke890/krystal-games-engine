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

  #calculateImpulsesForElastic(vAi: number, vBi: number, mA: number, mB: number): [number, number] {
    if (mA === mB) {
      return [vBi, vAi]; // Can just swap velocities if masses are equal
    }

    // Calculate new velocities using conservation of momentum equation:
    const totalMass = mA + mB;
    const vAf = ((mA - mB) * vAi + 2 * mB * vBi) / totalMass;
    const vBf = (2 * mA * vAi + (mB - mA) * vBi) / totalMass;

    if (vAi + vAf !== vBi + vBf) {
      console.log(Math.abs(vAi + vAf) - Math.abs(vBi + vBf));
    }

    return [vAf, vBf];
  }

  #calcPerfectlyInelasticImpulses(
    vAi: number,
    vBi: number,
    mA: number,
    mB: number
  ): [number, number] {
    const fA = mA * vAi;
    const fB = mB * vBi;
    const totalMass = mA + mB;
    const impulse = (fA + fB) / totalMass;
    return [impulse, impulse];
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

              const [velA, velB] = this.#calculateImpulsesForElastic(
                a.Velocity.x,
                b.Velocity.x,
                a.Mass!.value,
                b.Mass!.value
              );

              a.Velocity.x = velA;
              b.Velocity.x = velB;
            } else if (b.Collision.hasEntityCollisionType("RIGID")) {
              a.Position.x -= overlap * 2;
              a.Velocity.x = -a.Velocity.x;
            }
          } else if (a.Collision.hasEntityCollisionType("RIGID")) {
            if (b.Collision.hasEntityCollisionType("BOUNCE")) {
              b.Position.x += overlap * 2;
              b.Velocity.x = -b.Velocity.x;
            }
          }
        }
        return;
      case SIDES.RIGHT:
        {
          const overlap = b.Position.x + b.Size.x - a.Position.x;
          if (overlap < 0) break;

          if (a.Collision.hasEntityCollisionType("BOUNCE")) {
            if (b.Collision.hasEntityCollisionType("BOUNCE")) {
              a.Position.x += overlap;
              b.Position.x -= overlap;

              const [velA, velB] = this.#calculateImpulsesForElastic(
                a.Velocity.x,
                b.Velocity.x,
                a.Mass!.value,
                b.Mass!.value
              );

              a.Velocity.x = velA;
              b.Velocity.x = velB;
            } else if (b.Collision.hasEntityCollisionType("RIGID")) {
              a.Position.x += overlap * 2;
              a.Velocity.x = -a.Velocity.x;
            }
          } else if (a.Collision.hasEntityCollisionType("RIGID")) {
            if (b.Collision.hasEntityCollisionType("BOUNCE")) {
              b.Position.x -= overlap * 2;
              b.Velocity.x = -b.Velocity.x;
            }
          }
        }
        return;
      case SIDES.TOP:
        {
          const overlap = a.Position.y + a.Size.y - b.Position.y;
          if (overlap < 0) break;

          if (a.Collision.hasEntityCollisionType("BOUNCE")) {
            if (b.Collision.hasEntityCollisionType("BOUNCE")) {
              a.Position.y -= overlap;
              b.Position.y += overlap;

              const [velA, velB] = this.#calculateImpulsesForElastic(
                a.Velocity.y,
                b.Velocity.y,
                a.Mass!.value,
                b.Mass!.value
              );

              a.Velocity.y = velA;
              b.Velocity.y = velB;
            } else if (b.Collision.hasEntityCollisionType("RIGID")) {
              a.Position.y -= overlap * 2;
              a.Velocity.y = -a.Velocity.y;
            }
          } else if (a.Collision.hasEntityCollisionType("RIGID")) {
            if (b.Collision.hasEntityCollisionType("BOUNCE")) {
              b.Position.y += overlap * 2;
              b.Velocity.y = -b.Velocity.y;
            }
          }
        }
        return;
      case SIDES.BOTTOM:
        {
          const overlap = b.Position.y + b.Size.y - a.Position.y;
          if (overlap < 0) break;

          if (a.Collision.hasEntityCollisionType("BOUNCE")) {
            if (b.Collision.hasEntityCollisionType("BOUNCE")) {
              a.Position.y += overlap;
              b.Position.y -= overlap;

              const [velA, velB] = this.#calculateImpulsesForElastic(
                a.Velocity.y,
                b.Velocity.y,
                a.Mass!.value,
                b.Mass!.value
              );

              a.Velocity.y = velA;
              b.Velocity.y = velB;
            } else if (b.Collision.hasEntityCollisionType("RIGID")) {
              a.Position.y += overlap * 2;
              a.Velocity.y = -a.Velocity.y;
            }
          } else if (a.Collision.hasEntityCollisionType("RIGID")) {
            if (b.Collision.hasEntityCollisionType("BOUNCE")) {
              b.Position.y -= overlap * 2;
              b.Velocity.y = -b.Velocity.y;
            }
          }
        }
        return;
      default:
        return;
    }
  }

  #resolvePerfectlyInelastic(a: ResolverComponents, b: ResolverComponents, side: Side): void {
    // m1 v1i + m2 v2i = ( m1 + m2) vf
    switch (side) {
      case SIDES.LEFT:
        {
          const overlap = a.Position.x + a.Size.x - b.Position.x;
          if (overlap < 0) return;

          if (a.Collision.hasEntityCollisionType("BOUNCE")) {
            if (b.Collision.hasEntityCollisionType("BOUNCE")) {
              a.Position.x -= overlap;
              b.Position.x += overlap;

              const [velA, velB] = this.#calcPerfectlyInelasticImpulses(
                a.Velocity.x,
                b.Velocity.x,
                a.Mass!.value,
                b.Mass!.value
              );

              a.Velocity.x = velA;
              b.Velocity.x = velB;
            } else if (b.Collision.hasEntityCollisionType("RIGID")) {
              a.Position.x -= overlap * 2;
              a.Velocity.x = -a.Velocity.x;
            }
          } else if (a.Collision.hasEntityCollisionType("RIGID")) {
            if (b.Collision.hasEntityCollisionType("BOUNCE")) {
              b.Position.x += overlap * 2;
              b.Velocity.x = -b.Velocity.x;
            }
          }
        }
        return;
      case SIDES.RIGHT:
        {
          const overlap = b.Position.x + b.Size.x - a.Position.x;
          if (overlap < 0) return;

          if (a.Collision.hasEntityCollisionType("BOUNCE")) {
            if (b.Collision.hasEntityCollisionType("BOUNCE")) {
              a.Position.x -= overlap;
              b.Position.x += overlap;

              const [velA, velB] = this.#calcPerfectlyInelasticImpulses(
                a.Velocity.x,
                b.Velocity.x,
                a.Mass!.value,
                b.Mass!.value
              );

              a.Velocity.x = velA;
              b.Velocity.x = velB;
            } else if (b.Collision.hasEntityCollisionType("RIGID")) {
              a.Position.x -= overlap * 2;
              a.Velocity.x = -a.Velocity.x;
            }
          } else if (a.Collision.hasEntityCollisionType("RIGID")) {
            if (b.Collision.hasEntityCollisionType("BOUNCE")) {
              b.Position.x += overlap * 2;
              b.Velocity.x = -b.Velocity.x;
            }
          }
        }
        return;
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
