import { Collision } from "../components/collision.js";
import { Position } from "../components/position.js";
import { Size } from "../components/size.js";
import { EntityManager } from "../entities/entity-manager.js";
import { Guard } from "../utils/guard.js";
import { PairedSet } from "../utils/paired-set.js";

export class CollisionDetector {
  entityManager: EntityManager;
  pairedSet: PairedSet<number>;

  constructor(entityManager: EntityManager) {
    Guard.againstNull({ entityManager }).isInstanceOf(EntityManager);
    this.entityManager = entityManager;
    this.pairedSet = new PairedSet();
  }

  /**
   * @returns An array of entity pairs that have collided.
   */
  detect(collidables: [number, Position, Collision][]): PairedSet<number> {
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

    return this.pairedSet;
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
