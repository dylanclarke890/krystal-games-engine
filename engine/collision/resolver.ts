import { Bounciness } from "../components/bounciness.js";
import { Mass } from "../components/mass.js";
import { EntityManager } from "../entities/entity-manager.js";
import { Viewport } from "../graphics/viewport.js";
import { Assert } from "../utils/assert.js";
import { PairedSet } from "../utils/paired-set.js";
import { ComponentMap, ComponentType } from "../utils/types.js";

type RequiredComponents = "Position" | "Velocity" | "Size" | "Collision";
type OptionalComponents = "Bounciness" | "Mass";
type ResolverComponents = DefinedExcept<ComponentMap<RequiredComponents | OptionalComponents>, OptionalComponents>;

export class CollisionResolver {
  static components: ComponentType[] = ["Position", "Velocity", "Size", "Collision", "Bounciness", "Mass"];
  static componentDefaults = { bounce: new Bounciness(1), mass: new Mass(1) };

  entityManager: EntityManager;
  viewport: Viewport;

  constructor(entityManager: EntityManager, viewport: Viewport) {
    Assert.instanceOf("entityManager", entityManager, EntityManager);
    Assert.instanceOf("viewport", viewport, Viewport);
    this.entityManager = entityManager;
    this.viewport = viewport;
  }

  resolve(collided: PairedSet<number>): void {
    collided.forEach((v) => {
      const [a, b] = v;
      this.resolvePair(a, b);
    });
  }

  resolvePair(entityA: number, entityB: number): void {
    const em = this.entityManager;
    const defaults = CollisionResolver.componentDefaults;
    const a = em.getComponents(entityA, ...CollisionResolver.components) as ResolverComponents;
    a.Bounciness ??= defaults.bounce;
    a.Mass ??= defaults.mass;

    const b = em.getComponents(entityB, ...CollisionResolver.components) as ResolverComponents;
    b.Bounciness ??= defaults.bounce;
    b.Mass ??= defaults.mass;

    // const side = this.#findSideOfCollision(a, b);
    // const totalBounciness = a.Bounciness.value * b.Bounciness.value;
  }

  findSideOfCollision(a: ResolverComponents, b: ResolverComponents): SideOfCollision {
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
      return dx > 0 ? "right" : "left";
    }
    return dy > 0 ? "bottom" : "top";
  }
}
