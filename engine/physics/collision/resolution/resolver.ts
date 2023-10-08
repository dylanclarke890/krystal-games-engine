import { Collider, RigidBody } from "../../../components/2d/index.js";
import { GameEvents, SideOfCollision } from "../../../constants/enums.js";
import { Viewport } from "../../../graphics/viewport.js";
import { Assert } from "../../../utils/assert.js";
import { IEntityManager, IEventManager } from "../../../types/common-interfaces.js";
import { Vector2D } from "../../../utils/maths/vector-2d.js";
import { Collidable } from "../../../types/common-types.js";

type ResolverData = { entityCollisions: Set<Pair<Collidable>>; viewportCollisions: Set<Collidable> };

export class CollisionResolver {
  entityManager: IEntityManager;
  eventManager: IEventManager;
  viewport: Viewport;

  constructor(entityManager: IEntityManager, eventManager: IEventManager, viewport: Viewport) {
    Assert.instanceOf("viewport", viewport, Viewport);
    this.entityManager = entityManager;
    this.eventManager = eventManager;
    this.viewport = viewport;
  }

  resolve(data: ResolverData) {
    this.#resolveEntityCollisions(data.entityCollisions);
    this.#resolveViewportCollisions(data.viewportCollisions);
  }

  #resolveEntityCollisions(entityCollisions: Set<Pair<Collidable>>): void {
    entityCollisions.forEach(([[aId, aRigidBody, aCollider], [bId, bRigidBody, bCollider]]) => {
      if (typeof aRigidBody === "undefined" || typeof bRigidBody === "undefined") {
        return;
      }

      const side = this.#findSideOfEntityCollision(aRigidBody, aCollider, bRigidBody, bCollider);
      this.eventManager.trigger(GameEvents.ENTITY_COLLIDED, {
        a: { id: aId, rigidBody: aRigidBody },
        b: { id: bId, rigidBody: bRigidBody },
        side,
      });
    });
  }

  #findSideOfEntityCollision(
    aRigidBody: RigidBody,
    aCollider: Collider,
    bRigidBody: RigidBody,
    bCollider: Collider
  ): SideOfCollision {
    const aHalfX = aCollider.size.x / 2;
    const bHalfX = bCollider.size.x / 2;

    const aHalfY = aCollider.size.y / 2;
    const bHalfY = bCollider.size.y / 2;

    // Get midpoints
    const aMidX = aRigidBody.transform.position.x + aHalfX;
    const aMidY = aRigidBody.transform.position.y + aHalfY;
    const bMidX = bRigidBody.transform.position.x + bHalfX;
    const bMidY = bRigidBody.transform.position.y + bHalfY;

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

  #resolveViewportCollisions(viewportCollisions: Set<Collidable>): void {
    viewportCollisions.forEach(([id, rigidBody, collider]) => {
      const side = this.#findSideOfViewportCollision(rigidBody.transform.position, collider.size);

      if (side === SideOfCollision.None) {
        return;
      }

      this.eventManager.trigger(GameEvents.VIEWPORT_COLLISION, { id, rigidBody, collider, side });
    });
  }

  #findSideOfViewportCollision(position: Vector2D, size: Vector2D): SideOfCollision {
    if (position.x < 0) {
      return SideOfCollision.Left;
    }

    if (position.x + size.x > this.viewport.width) {
      return SideOfCollision.Right;
    }

    if (position.y < 0) {
      return SideOfCollision.Top;
    }

    if (position.y + size.y > this.viewport.height) {
      return SideOfCollision.Bottom;
    }

    return SideOfCollision.None;
  }
}
