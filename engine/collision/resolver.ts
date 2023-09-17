import { Bounciness } from "../components/bounciness.js";
import { Mass } from "../components/mass.js";
import { EntityManager } from "../entities/entity-manager.js";
import { Viewport } from "../graphics/viewport.js";
import { Assert } from "../utils/assert.js";
import { ComponentMap } from "../utils/types.js";

const SIDES = { LEFT: 0, TOP: 1, RIGHT: 2, BOTTOM: 3 } as const;
type Side = (typeof SIDES)[Key<typeof SIDES>];
type RequiredComponents = "Position" | "Velocity" | "Size" | "Collision";
type OptionalComponents = "Bounciness" | "Mass";
type ResolverComponents = DefinedExcept<ComponentMap<RequiredComponents | OptionalComponents>, OptionalComponents>;

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

  resolve(collided): void {
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

    // const side = this.#findSideOfCollision(a, b);
    // const totalBounciness = a.Bounciness.value * b.Bounciness.value;
  }

  findSideOfCollision(a: ResolverComponents, b: ResolverComponents): Side {
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

  resolveViewportCollisions(collisions): void {
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

      if (viewportCollisions.left) {
        entity.Position.x = 0;
        entity.Velocity.x = -entity.Velocity.x * entity.Bounciness.value;
      }
      if (viewportCollisions.right) {
        entity.Position.x = this.viewport.width - entity.Size.x;
        entity.Velocity.x = -entity.Velocity.x * entity.Bounciness.value;
      }
      if (viewportCollisions.top) {
        entity.Position.y = 0;
        entity.Velocity.y = -entity.Velocity.y * entity.Bounciness.value;
      }
      if (viewportCollisions.bottom) {
        entity.Position.y = this.viewport.height - entity.Size.y;
        entity.Velocity.y = -entity.Velocity.y * entity.Bounciness.value;
      }
    });
  }
}
