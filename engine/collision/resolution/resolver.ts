import { Bounciness, Mass, Position, Size } from "../../components/2d/index.js";
import { SideOfCollision } from "../../constants/enums.js";
import { Viewport } from "../../graphics/viewport.js";
import { Assert } from "../../utils/assert.js";
import { PairedSet } from "../../utils/paired-set.js";
import { ComponentType, Components } from "../../types/common-types.js";
import { IEntityManager } from "../../types/common-interfaces.js";

type ResolverComponents = Components<"Position" | "Velocity" | "Size" | "Collision", "Bounciness" | "Mass">;
type ResolverData = { entityCollisions: PairedSet<number>; viewportCollisions: Set<number> };

export class CollisionResolver {
  static components: ComponentType[] = ["Position", "Velocity", "Size", "Collision", "Bounciness", "Mass"];
  static componentDefaults = { bounce: new Bounciness(1), mass: new Mass(1) };

  entityManager: IEntityManager;
  viewport: Viewport;

  constructor(entityManager: IEntityManager, viewport: Viewport) {
    Assert.instanceOf("viewport", viewport, Viewport);
    this.entityManager = entityManager;
    this.viewport = viewport;
  }

  getComponentsForEntity(entityId: number): Defined<ResolverComponents> {
    const components = this.entityManager.getComponents(entityId, CollisionResolver.components) as ResolverComponents;
    components.Bounciness ??= CollisionResolver.componentDefaults.bounce;
    components.Mass ??= CollisionResolver.componentDefaults.mass;

    return components as Defined<ResolverComponents>;
  }

  resolve(data: ResolverData) {
    this.resolveEntityCollisions(data.entityCollisions);
    this.resolveViewportCollisions(data.viewportCollisions);
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
      return dx > 0 ? SideOfCollision.Right : SideOfCollision.Left;
    }
    return dy > 0 ? SideOfCollision.Bottom : SideOfCollision.Top;
  }

  #findSideOfViewportCollision(position: Position, size: Size): SideOfCollision {
    const { x, y } = position;

    if (x < 0) {
      return SideOfCollision.Left;
    }

    if (x + size.x > this.viewport.width) {
      return SideOfCollision.Right;
    }

    if (y < 0) {
      return SideOfCollision.Top;
    }

    if (y + size.y > this.viewport.height) {
      return SideOfCollision.Bottom;
    }

    return SideOfCollision.None;
  }

  #resolveEntityCollision(a: Defined<ResolverComponents>, b: Defined<ResolverComponents>, side: SideOfCollision): void {
    const collisionBehaviourA = a.Collision.entityCollisionBehaviour;
    const collisionBehaviourB = b.Collision.entityCollisionBehaviour;

    if (side === SideOfCollision.None || collisionBehaviourA === "NONE" || collisionBehaviourB === "NONE") {
      return;
    }
  }

  #resolveViewportCollision(entity: Defined<ResolverComponents>, side: SideOfCollision): void {
    const viewportCollisionBehaviour = entity.Collision.viewportCollisionBehaviour;

    if (side === SideOfCollision.None || viewportCollisionBehaviour === "NONE") {
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
      case SideOfCollision.Left:
        entity.Position.x = entity.Size.x;
        entity.Velocity.x *= -entity.Bounciness.value;
        break;
      case SideOfCollision.Right:
        entity.Position.x = this.viewport.width - entity.Size.x;
        entity.Velocity.x *= -entity.Bounciness.value;
        break;
      case SideOfCollision.Top:
        entity.Position.y = entity.Size.y;
        entity.Velocity.y *= -entity.Bounciness.value;
        break;
      case SideOfCollision.Left:
        entity.Position.y = this.viewport.height - entity.Size.y;
        entity.Velocity.y *= -entity.Bounciness.value;
        break;
      default:
        return;
    }
  }
}
