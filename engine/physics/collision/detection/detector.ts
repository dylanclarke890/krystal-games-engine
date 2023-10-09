import { Viewport } from "../../../graphics/viewport.js";
import { Assert } from "../../../utils/assert.js";
import { areRectsColliding } from "./detection-strategies.js";
import { IEntityManager, IQuadtree } from "../../../types/common-interfaces.js";
import { Collidable } from "../../../types/common-types.js";
import { RigidBody } from "../../../components/rigid-body.js";
import { Collider } from "../../../components/collision.js";
import { ShapeType } from "../../../constants/enums.js";
import { InvalidOperationError } from "../../../types/errors.js";

export class CollisionDetector {
  entityManager: IEntityManager;
  viewport: Viewport;
  quadtree: IQuadtree;
  entityCollisions: Set<Pair<Collidable>>;
  viewportCollisions: Set<Collidable>;
  collisionChecks: number;

  constructor(entityManager: IEntityManager, viewport: Viewport, quadtree: IQuadtree) {
    Assert.instanceOf("viewport", viewport, Viewport);

    this.entityManager = entityManager;
    this.viewport = viewport;
    this.quadtree = quadtree;

    this.entityCollisions = new Set();
    this.viewportCollisions = new Set();
    this.collisionChecks = 0;
  }

  detect(collidables: Collidable[]) {
    this.entityCollisions.clear();
    this.viewportCollisions.clear();
    this.collisionChecks = 0;

    for (let i = 0; i < collidables.length; i++) {
      const [aId, aRigidBody, aCollider] = collidables[i];

      if (this.viewportCollisionCheck(aRigidBody, aCollider)) {
        this.viewportCollisions.add(collidables[i]);
      }

      const possibleCollisions = this.quadtree.retrieve(aRigidBody, aCollider);

      for (let j = 0; j < possibleCollisions.length; j++) {
        this.collisionChecks++;
        const bEntityNode = possibleCollisions[j];
        if (aId === bEntityNode.id) {
          continue;
        }

        if (areRectsColliding(aRigidBody.transform.position, aCollider.size, bEntityNode.position, bEntityNode.size)) {
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
    const size = collider.size;

    switch (collider.shape) {
      case ShapeType.Circle:
        const rx = collider.size.x / 2;
        const ry = collider.size.y / 2;
        if (pos.x - rx < 0 || pos.x + rx > this.viewport.width || pos.y - rx < 0 || pos.y + ry > this.viewport.height) {
          return true;
        }
        break;
      case ShapeType.Rectangle:
        if (pos.x < 0 || pos.x + size.x > this.viewport.width || pos.y < 0 || pos.y + size.y > this.viewport.height) {
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
