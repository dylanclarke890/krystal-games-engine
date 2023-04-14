import { Collision, Position, Size } from "../components/index.js";
import { EntityManager } from "../entities/entity-manager.js";
import { Assert } from "../utils/assert.js";
import { PairedSet } from "../utils/paired-set.js";
import { DetectionResult } from "../utils/types.js";

export class CollisionDetector {
  entityManager: EntityManager;
  pairedSet: PairedSet<number>;

  constructor(entityManager: EntityManager) {
    Assert.instanceOf("entityManager", entityManager, EntityManager);
    this.entityManager = entityManager;
    this.pairedSet = new PairedSet();
  }

  detect(collidables: [number, Position, Collision][]): DetectionResult {
    const em = this.entityManager;
    this.pairedSet.clear();

    for (let i = 0; i < collidables.length; i++) {
      const [a, posA] = collidables[i];
      const sizeA = em.getComponent(a, "Size")!;
      for (let j = 0; j < collidables.length; j++) {
        const [b, posB] = collidables[j];
        if (a === b) continue;
        const sizeB = em.getComponent(b, "Size")!;
        if (this.AABBCollisionCheck(posA, sizeA, posB, sizeB)) {
          this.pairedSet.add([a, b]);
        }
      }
    }

    return { entityCollisions: this.pairedSet, viewportCollisions: [] };
  }

  /**
   * Aligned Axis Bounding Box check.
   */
  AABBCollisionCheck(posA: Position, sizeA: Size, posB: Position, sizeB: Size): boolean {
    return (
      posA.x < posB.x + sizeB.x &&
      posA.x + sizeA.x > posB.x &&
      posA.y < posB.y + sizeB.y &&
      posA.y + sizeA.y > posB.y
    );
  }
}
