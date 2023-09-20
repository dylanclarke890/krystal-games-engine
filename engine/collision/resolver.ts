import { Bounciness, Mass, Position, Size } from "../components/index.js";
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

  getComponentsForEntity(entityId: number): Defined<ResolverComponents> {
    const entity = this.entityManager.getComponents(entityId, CollisionResolver.components) as ResolverComponents;
    entity.Bounciness ??= CollisionResolver.componentDefaults.bounce;
    entity.Mass ??= CollisionResolver.componentDefaults.mass;

    return entity as Defined<ResolverComponents>;
  }

  resolveEntityCollisions(entityCollisions: PairedSet<number>) {
    entityCollisions.forEach((pair) => {
      const a = this.getComponentsForEntity(pair[0]);
      const b = this.getComponentsForEntity(pair[1]);
      const side = this.#findSideOfEntityCollision(a, b);

      this.#resolveEntityCollision(a, b, side);
      a.Collision.onEntityCollisionCallbacks.forEach((func) => func(pair[0], pair[1], side));
      b.Collision.onEntityCollisionCallbacks.forEach((func) => func(pair[0], pair[1], side));
    });
  }
  resolveViewportCollisions(viewportCollisions: Set<number>) {
    viewportCollisions.forEach((entityId) => {
      const entity = this.getComponentsForEntity(entityId);
      const side = this.#findSideOfViewportCollision(entity.Position, entity.Size);

      this.#resolveViewportCollision(entity, side);
      entity.Collision.onViewportCollisionCallbacks.forEach((func) => func(entityId, side));
    });
  }

  #findSideOfEntityCollision(a: Defined<ResolverComponents>, b: Defined<ResolverComponents>): SideOfCollision {
    const aHalfX = a.Size.x / 2;
    const bHalfX = b.Size.x / 2;
    const aHalfY = a.Size.y / 2;
    const bHalfY = b.Size.y / 2;

    // Get midpoints
    const aMidX = a.Position.x + aHalfX;
    const aMidY = a.Position.y + aHalfY;
    const bMidX = b.Position.x + bHalfX;
    const bMidY = b.Position.y + bHalfY;

    // Find side of entry based on the normalized sides
    const dx = (aMidX - bMidX) / (aHalfX + bHalfX);
    const dy = (aMidY - bMidY) / (aHalfY + bHalfY);
    const absDX = Math.abs(dx);
    const absDY = Math.abs(dy);

    if (absDX > absDY) {
      return dx > 0 ? "RIGHT" : "LEFT";
    }
    return dy > 0 ? "BOTTOM" : "TOP";
  }

  #findSideOfViewportCollision(position: Position, size: Size): SideOfCollision {
    const { x, y } = position;

    if (x < 0) {
      return "LEFT";
    }

    if (x + size.x > this.viewport.width) {
      return "RIGHT";
    }

    if (y < 0) {
      return "TOP";
    }

    if (y + size.y > this.viewport.height) {
      return "BOTTOM";
    }

    return "NONE";
  }

  #resolveEntityCollision(a: Defined<ResolverComponents>, b: Defined<ResolverComponents>, side: SideOfCollision): void {
    const collisionBehaviourA = a.Collision.entityCollisionBehaviour;
    const collisionBehaviourB = b.Collision.entityCollisionBehaviour;

    if (side === "NONE" || collisionBehaviourA === "NONE" || collisionBehaviourB === "NONE") {
      return;
    }
  }

  #resolveViewportCollision(entity: Defined<ResolverComponents>, side: SideOfCollision): void {
    const viewportCollisionBehaviour = entity.Collision.viewportCollisionBehaviour;

    if (side === "NONE" || viewportCollisionBehaviour === "NONE") {
      return;
    }

    switch (viewportCollisionBehaviour) {
      case "BOUNCE":
        this.#resolveViewportBounce(entity, side);
        break;
      default:
        break;
    }
  }

  #resolveViewportBounce(entity: Defined<ResolverComponents>, side: SideOfCollision) {
    switch (side) {
      case "LEFT":
        entity.Position.x = entity.Size.x;
        entity.Velocity.x *= -entity.Bounciness.value;
        break;
      case "RIGHT":
        entity.Position.x = this.viewport.width - entity.Size.x;
        entity.Velocity.x *= -entity.Bounciness.value;
        break;
      case "TOP":
        entity.Position.y = entity.Size.y;
        entity.Velocity.y *= -entity.Bounciness.value;
        break;
      case "BOTTOM":
        entity.Position.y = this.viewport.height - entity.Size.y;
        entity.Velocity.y *= -entity.Bounciness.value;
        break;
      default:
        return;
    }
  }
}
