import { EntityManager } from "../entities/entity-manager.js";
import { Guard } from "../utils/guard.js";
import { PairedSet } from "./paired-set.js";

export class CollisionDetector {
  /** @type {EntityManager} */
  entityManager;
  /** @type {PairedSet} */
  pairedSet;

  /**
   * @param {EntityManager} entityManager
   */
  constructor(entityManager) {
    Guard.againstNull({ entityManager }).isInstanceOf(EntityManager);
    this.entityManager = entityManager;
    this.pairedSet = new PairedSet();
  }

  /**
   * @param {[number, import("../components/position.js").Position, import("../components/collision.js").Collision][]} collidables
   * @returns {PairedSet} An array of entity pairs that have collided.
   */
  detect(collidables) {
    const em = this.entityManager;
    this.pairedSet.clear();

    for (let i = 0; i < collidables.length; i++) {
      const [a, posA] = collidables[i];
      const sizeA = em.getComponent(a, "Size");
      for (let j = 0; j < collidables.length; j++) {
        const [b, posB] = collidables[j];
        if (a === b) continue;
        const sizeB = em.getComponent(b, "Size");
        if (this.AABBCollisionCheck(posA, sizeA, posB, sizeB)) {
          this.pairedSet.add([a, b]);
        }
      }
    }

    return this.pairedSet;
  }

  /**
   * Aligned Axis Bounding Box check.
   * @param {import("../components/position.js").Position} posA
   * @param {import("../components/size.js").Size} sizeA
   * @param {import("../components/position.js").Position} posB
   * @param {import("../components/size.js").Size} sizeB
   * @returns {boolean}
   */
  AABBCollisionCheck(posA, sizeA, posB, sizeB) {
    return (
      posA.x < posB.x + sizeB.x &&
      posA.x + sizeA.x > posB.x &&
      posA.y < posB.y + sizeB.y &&
      posA.y + sizeA.y > posB.y
    );
  }
}
