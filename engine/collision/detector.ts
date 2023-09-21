import { Position, Size } from "../components/index.js";
import { EntityManager } from "../entities/entity-manager.js";
import { EntityQuadtree } from "../entities/entity-quadtree.js";
import { Viewport } from "../graphics/viewport.js";
import { Assert } from "../utils/assert.js";
import { PairedSet } from "../utils/paired-set.js";
import { Collidable } from "../utils/types.js";

export class CollisionDetector {
  entityManager: EntityManager;
  viewport: Viewport;
  quadtree: EntityQuadtree;
  entityCollisions: PairedSet<number>;
  viewportCollisions: Set<number>;

  constructor(entityManager: EntityManager, viewport: Viewport, quadtree: EntityQuadtree) {
    Assert.instanceOf("entityManager", entityManager, EntityManager);
    Assert.instanceOf("viewport", viewport, Viewport);
    Assert.instanceOf("quadtree", quadtree, EntityQuadtree);

    this.entityManager = entityManager;
    this.viewport = viewport;
    this.quadtree = quadtree;

    this.entityCollisions = new PairedSet();
    this.viewportCollisions = new Set();
  }

  detect(collidables: Collidable[]) {
    this.entityCollisions.clear();
    this.viewportCollisions.clear();

    for (let i = 0; i < collidables.length; i++) {
      const [idA, entityA] = collidables[i];

      if (this.viewportCollisionCheck(entityA.Position, entityA.Size!)) {
        this.viewportCollisions.add(idA);
      }

      for (let j = 0; j < collidables.length; j++) {
        const [idB, entityB] = collidables[j];

        if (idA === idB || entityA.Collision!.collisionLayer !== entityB.Collision!.collisionLayer) {
          continue;
        }

        if (this.AABBCollisionCheck(entityA.Position, entityA.Size!, entityB.Position, entityB.Size!)) {
          this.entityCollisions.add(idA, idB);
        }
      }
    }
  }

  viewportCollisionCheck(position: Position, size: Size): boolean {
    const { x, y } = position;
    if (x < 0 || x + size.x > this.viewport.width || y < 0 || y + size.y > this.viewport.height) {
      return true;
    }

    return false;
  }

  /**
   * Aligned Axis Bounding Box check.
   */
  AABBCollisionCheck(posA: Position, sizeA: Size, posB: Position, sizeB: Size): boolean {
    return (
      posA.x < posB.x + sizeB.x && posA.x + sizeA.x > posB.x && posA.y < posB.y + sizeB.y && posA.y + sizeA.y > posB.y
    );
  }
}
