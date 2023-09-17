import { Position, Size } from "../components/index.js";
import { EntityManager } from "../entities/entity-manager.js";
import { Viewport } from "../graphics/viewport.js";
import { Assert } from "../utils/assert.js";
import { PairedSet } from "../utils/paired-set.js";
import { Collidable } from "../utils/types.js";

export class CollisionDetector {
  entityManager: EntityManager;
  viewport: Viewport;
  entityCollisions: PairedSet<number>;

  constructor(entityManager: EntityManager, viewport: Viewport) {
    Assert.instanceOf("entityManager", entityManager, EntityManager);
    Assert.instanceOf("viewport", viewport, Viewport);
    this.entityManager = entityManager;
    this.viewport = viewport;
    this.entityCollisions = new PairedSet();
  }

  detect(collidables: Collidable[]) {
    this.entityCollisions.clear();

    for (let i = 0; i < collidables.length; i++) {
      const [a, posA, collisionA] = collidables[i];
      for (let j = 0; j < collidables.length; j++) {
        const [b, posB, collisionB] = collidables[j];

        if (a === b || collisionA.collisionLayer !== collisionB.collisionLayer) {
          continue;
        }

        const sizeA = this.entityManager.getComponent(a, "Size")!;
        const sizeB = this.entityManager.getComponent(b, "Size")!;
        if (this.AABBCollisionCheck(posA, sizeA, posB, sizeB)) {
          this.entityCollisions.add(a, b);
        }
      }
    }

    return { entityCollisions: this.entityCollisions };
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
