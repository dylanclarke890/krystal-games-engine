import { Bounciness } from "../components/bounciness.js";
import { Mass } from "../components/mass.js";
import { Position } from "../components/position.js";
import { Size } from "../components/size.js";
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

  resolve(entityCollisions: PairedSet<number>, viewportCollisions: Set<number>): void {
    const em = this.entityManager;
    const defaults = CollisionResolver.componentDefaults;

    entityCollisions.forEach((pair) => {
      const a = em.getComponents(pair[0], ...CollisionResolver.components) as ResolverComponents;
      a.Bounciness ??= defaults.bounce;
      a.Mass ??= defaults.mass;

      const b = em.getComponents(pair[1], ...CollisionResolver.components) as ResolverComponents;
      b.Bounciness ??= defaults.bounce;
      b.Mass ??= defaults.mass;

      const side = this.#findSideOfEntityCollision(a, b);
      if (side === "none") {
        return;
      }

      this.#resolveEntityCollision(a, b, side);

      a.Collision.onEntityCollisionCallbacks.forEach((func) => func(pair[0], pair[1], side));
      b.Collision.onEntityCollisionCallbacks.forEach((func) => func(pair[0], pair[1], side));
    });

    viewportCollisions.forEach((entityId) => {
      const entity = em.getComponents(entityId, ...CollisionResolver.components) as ResolverComponents;

      const side = this.#findSideOfViewportCollision(entity.Position, entity.Size);
      if (side === "none") {
        return;
      }

      this.#resolveViewportCollision(entity, side);

      entity.Collision.onViewportCollisionCallbacks.forEach((func) => func(entityId, side));
    });
  }

  #findSideOfEntityCollision(a: ResolverComponents, b: ResolverComponents): SideOfCollision {
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

  #findSideOfViewportCollision(position: Position, size: Size): SideOfCollision {
    const { x, y } = position;

    if (x < 0) {
      return "left";
    }

    if (x + size.x > this.viewport.width) {
      return "right";
    }

    if (y < 0) {
      return "top";
    }

    if (y + size.y > this.viewport.height) {
      return "bottom";
    }

    return "none";
  }

  #resolveEntityCollision(a: ResolverComponents, b: ResolverComponents, side: SideOfCollision): void {
    console.log(a, b, side);
  }

  #resolveViewportCollision(entity: ResolverComponents, side: SideOfCollision): void {
    console.log(entity, side);
  }
}
