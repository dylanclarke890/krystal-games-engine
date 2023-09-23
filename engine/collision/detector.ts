import { Position, Size } from "../components/2d/index.js";
import { EntityQuadtree } from "../entities/entity-quadtree.js";
import { Viewport } from "../graphics/viewport.js";
import { Assert } from "../utils/assert.js";
import { PairedSet } from "../utils/paired-set.js";
import { Collidable } from "../types/common-types.js";
import { rectVsRect } from "./detection-strategies.js";
import { IEntityManager } from "../types/common-interfaces.js";

export class CollisionDetector {
  entityManager: IEntityManager;
  viewport: Viewport;
  quadtree: EntityQuadtree;
  entityCollisions: PairedSet<number>;
  viewportCollisions: Set<number>;
  collisionChecks: number;

  constructor(entityManager: IEntityManager, viewport: Viewport, quadtree: EntityQuadtree) {
    Assert.instanceOf("viewport", viewport, Viewport);
    Assert.instanceOf("quadtree", quadtree, EntityQuadtree);

    this.entityManager = entityManager;
    this.viewport = viewport;
    this.quadtree = quadtree;

    this.entityCollisions = new PairedSet();
    this.viewportCollisions = new Set();
    this.collisionChecks = 0;
  }

  detect(collidables: Collidable[]) {
    this.entityCollisions.clear();
    this.viewportCollisions.clear();
    this.collisionChecks = 0;

    for (let i = 0; i < collidables.length; i++) {
      const [aId, aComponents] = collidables[i];

      if (this.viewportCollisionCheck(aComponents.Position, aComponents.Size!)) {
        this.viewportCollisions.add(aId);
      }

      const possibleCollisions = this.quadtree.findPossibleCollisions(aComponents.Position, aComponents.Size);

      for (let j = 0; j < possibleCollisions.length; j++) {
        this.collisionChecks++;
        const bEntityNode = possibleCollisions[j];
        const bId = bEntityNode.entityId;
        const bCollision = this.entityManager.getComponents(bId, ["Collision"]).Collision!;
        if (aId === bId || aComponents.Collision.collisionLayer !== bCollision.collisionLayer) {
          continue;
        }

        if (rectVsRect(aComponents.Position, aComponents.Size, bEntityNode.position, bEntityNode.size)) {
          this.entityCollisions.add(aId, bId);
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
}
