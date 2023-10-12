import { areRectsColliding } from "./detection-strategies.js";
import { IQuadtree } from "../../../types/common-interfaces.js";
import { Collidable } from "../../../types/common-types.js";
import { RigidBody } from "../../../components/rigid-body.js";
import { Collider } from "../../../components/collider.js";
import { ShapeType } from "../../../constants/enums.js";
import { InvalidOperationError } from "../../../types/errors.js";
import { GameContext } from "../../../core/context.js";

export class CollisionDetector {
  context: GameContext;
  quadtree: IQuadtree;
  entityCollisions: Set<Pair<Collidable>>;
  checkForCollisionsWithViewport: boolean;
  viewportCollisions: Set<Collidable>;
  collisionChecksThisFrame: number;

  constructor(context: GameContext, quadtree: IQuadtree) {
    this.context = context;
    this.quadtree = quadtree;

    this.checkForCollisionsWithViewport = context.config.getBool("handleViewportCollisions") ?? false;
    this.entityCollisions = new Set();
    this.viewportCollisions = new Set();
    this.collisionChecksThisFrame = 0;
  }

  detect(collidables: Collidable[]) {
    this.entityCollisions.clear();
    this.viewportCollisions.clear();
    this.collisionChecksThisFrame = 0;

    for (let i = 0; i < collidables.length; i++) {
      const [aId, aRigidBody, aCollider] = collidables[i];

      if (this.checkForCollisionsWithViewport && this.viewportCollisionCheck(aRigidBody, aCollider)) {
        this.viewportCollisions.add(collidables[i]);
      }

      const position = aRigidBody.transform.position.clone().add(aCollider.transform.position);
      const possibleCollisions = this.quadtree.retrieve(position, aCollider.bounds);

      for (let j = 0; j < possibleCollisions.length; j++) {
        this.collisionChecksThisFrame++;
        const bEntityNode = possibleCollisions[j];
        if (aId === bEntityNode.id) {
          continue;
        }

        if (areRectsColliding(aRigidBody.transform.position, aCollider.bounds, bEntityNode.position, bEntityNode.size)) {
          const bRigidBody = this.context.entities.getComponent(bEntityNode.id, "rigid-body")
          this.entityCollisions.add([
            [aId, aRigidBody, aCollider],
            [bEntityNode.id, bEntityNode.rigidBody!, bEntityNode.collider!],
          ]);
        }
      }
    }
  }

  viewportCollisionCheck(rigidBody: RigidBody, collider: Collider): boolean {
    const pos = rigidBody.transform.position;
    const size = collider.bounds;
    const viewport = this.context.viewport;

    switch (collider.shape) {
      case ShapeType.Circle:
        const rx = collider.bounds.x / 2;
        const ry = collider.bounds.y / 2;
        if (pos.x - rx < 0 || pos.x + rx > viewport.width || pos.y - rx < 0 || pos.y + ry > viewport.height) {
          return true;
        }
        break;
      case ShapeType.Rectangle:
        if (pos.x < 0 || pos.x + size.x > viewport.width || pos.y < 0 || pos.y + size.y > viewport.height) {
          return true;
        }
        break;
      case ShapeType.Polygon:
        break;
      default:
        throw new InvalidOperationError("Unknown collider shape type", collider);
    }

    return false;
  }
}
