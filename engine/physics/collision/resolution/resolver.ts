import { Collider, RigidBody } from "../../../components/index.js";
import { GameEvents, SideOfCollision } from "../../../constants/enums.js";
import { Vector2 } from "../../../maths/vector2.js";
import { Collidable } from "../../../types/common-types.js";
import { GameContext } from "../../../core/context.js";

type ResolverData = { entityCollisions: Set<Pair<Collidable>>; viewportCollisions: Set<Collidable> };

export class CollisionResolver {
  context: GameContext;

  constructor(context: GameContext) {
    this.context = context;
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
      this.context.events.trigger(GameEvents.ENTITY_COLLIDED, {
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
      return dx > 0 ? SideOfCollision.RIGHT : SideOfCollision.LEFT;
    }
    return dy > 0 ? SideOfCollision.BOTTOM : SideOfCollision.TOP;
  }

  #resolveViewportCollisions(viewportCollisions: Set<Collidable>): void {
    viewportCollisions.forEach(([id, rigidBody, collider]) => {
      const sides = this.#findSidesOfViewportCollision(rigidBody.transform.position, collider.size);

      if (sides === SideOfCollision.NONE) {
        return;
      }

      this.context.events.trigger(GameEvents.VIEWPORT_COLLISION, { id, rigidBody, collider, side: sides });
    });
  }

  #findSidesOfViewportCollision(position: Vector2, size: Vector2): SideOfCollision {
    if (position.x < 0) {
      return SideOfCollision.LEFT;
    }

    if (position.x + size.x > this.context.viewport.width) {
      return SideOfCollision.RIGHT;
    }

    if (position.y < 0) {
      return SideOfCollision.TOP;
    }

    if (position.y + size.y > this.context.viewport.height) {
      return SideOfCollision.BOTTOM;
    }

    return SideOfCollision.NONE;
  }
}
