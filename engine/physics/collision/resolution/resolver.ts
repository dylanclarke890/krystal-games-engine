import { Collider, RigidBody } from "../../../components/index.js";
import { GameEvents, ShapeType, SideOfCollision } from "../../../constants/enums.js";
import { Vector2 } from "../../../maths/vector2.js";
import { Collidable, ViewportCollisionEvent } from "../../../types/common-types.js";
import { GameContext } from "../../../core/context.js";
import { IObjectPool } from "../../../types/common-interfaces.js";
import { BitwiseFlags } from "../../../utils/bitwise-flags.js";

type ResolverData = { entityCollisions: Set<Pair<Collidable>>; viewportCollisions: Set<Collidable> };

export class CollisionResolver {
  context: GameContext;
  bitwiseFlagPool: IObjectPool<BitwiseFlags<SideOfCollision>>;
  handleViewportCollisions: boolean;

  constructor(context: GameContext) {
    this.context = context;
    this.handleViewportCollisions = context.config.getBool("handleViewportCollisions") ?? false;
    this.bitwiseFlagPool = context.objectPools.create("bitwiseFlags", BitwiseFlags, (flags) => flags.clear());
  }

  resolve(data: ResolverData) {
    this.#resolveEntityCollisions(data.entityCollisions);

    if (this.handleViewportCollisions) {
      this.#resolveViewportCollisions(data.viewportCollisions);
    }
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
      const sides = new BitwiseFlags<SideOfCollision>();
      this.#findSidesOfViewportCollision(rigidBody.transform.position, collider, sides);

      if (!sides.isSet()) {
        return;
      }

      const event: ViewportCollisionEvent = { id, rigidBody, collider, sides };
      this.context.events.trigger(GameEvents.VIEWPORT_COLLISION, event);
    });
  }

  #findSidesOfViewportCollision(position: Vector2, collider: Collider, flags: BitwiseFlags<SideOfCollision>): void {
    switch (collider.shape) {
      case ShapeType.Circle: {
        if (position.x - collider.size.x / 2 < 0) {
          flags.add(SideOfCollision.LEFT);
        }
        
        if (position.x + collider.size.x / 2 > this.context.viewport.width) {
          flags.add(SideOfCollision.RIGHT);
        }

        if (position.y - collider.size.y / 2 <0) {
          flags.add(SideOfCollision.TOP);
        }
        
        if (position.y + collider.size.y / 2 > this.context.viewport.height) {
          flags.add(SideOfCollision.BOTTOM);
        }
        break;
      }
      case ShapeType.Rectangle: {
        if (position.x < 0) {
          flags.add(SideOfCollision.LEFT);
        }
        
        if (position.x + collider.size.x > this.context.viewport.width) {
          flags.add(SideOfCollision.RIGHT);
        }

        if (position.y < 0) {
          flags.add(SideOfCollision.TOP);
        }
        
        if (position.y + collider.size.y > this.context.viewport.height) {
          flags.add(SideOfCollision.BOTTOM);
        }
        break;
      }
    }
  }
}
