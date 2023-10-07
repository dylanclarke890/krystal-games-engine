import { Viewport } from "../../../graphics/viewport.js";
import { Assert } from "../../../utils/assert.js";
import { rectVsRect } from "./detection-strategies.js";
import { IEntityManager, IQuadtree } from "../../../types/common-interfaces.js";
import { Collidable } from "../../../types/common-types.js";

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

      if (this.viewportCollisionCheck(aRigidBody.position, aCollider.size)) {
        this.viewportCollisions.add(collidables[i]);
      }

      const possibleCollisions = this.quadtree.retrieve(aRigidBody, aCollider);

      for (let j = 0; j < possibleCollisions.length; j++) {
        this.collisionChecks++;
        const bEntityNode = possibleCollisions[j];
        if (aId === bEntityNode.id) {
          continue;
        }

        if (rectVsRect(aRigidBody.position, aCollider.size, bEntityNode.position, bEntityNode.size)) {
          this.entityCollisions.add([
            [aId, aRigidBody, aCollider],
            [bEntityNode.id, bEntityNode.rigidBody!, bEntityNode.collider!],
          ]);
        }
      }
    }
  }

  viewportCollisionCheck(position: Vector, size: Vector): boolean {
    const { x, y } = position;
    if (x < 0 || x + size.x > this.viewport.width || y < 0 || y + size.y > this.viewport.height) {
      return true;
    }

    return false;
  }
}
