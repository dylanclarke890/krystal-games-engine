import { GameEvents } from "../events/events.js";
import { CollisionStrategy } from "./collision-strategy.js";

/**
 * Aligned Axis Bounding Box check.
 * @param {import("../components/position.js").Position} posA
 * @param {import("../components/size.js").Size} sizeA
 * @param {import("../components/position.js").Position} posB
 * @param {import("../components/size.js").Size} sizeB
 * @returns {boolean}
 */
export function AABBCollisionCheck(posA, sizeA, posB, sizeB) {
  return (
    posA.x < posB.x + sizeB.x &&
    posA.x + sizeA.x > posB.x &&
    posA.y < posB.y + sizeB.y &&
    posA.y + sizeA.y > posB.y
  );
}

export class AABBCollisionStrategy extends CollisionStrategy {
  /** @param {number[]} entities list of entity ids to check */
  resolve(entities) {
    const em = this.entityManager;
    for (let i = 0; i < entities.length; i++) {
      const entityA = entities[i];
      const posA = em.getComponent(entityA, "Position");
      const sizeA = em.getComponent(entityA, "Size");

      for (let j = 0; j < entities.length; j++) {
        const entityB = entities[j];
        const posB = em.getComponent(entityB, "Position");
        const sizeB = em.getComponent(entityB, "Size");
        if (this.areEntitiesColliding(posA, sizeA, posB, sizeB)) {
          this.eventSystem.dispatch(GameEvents.Entity_Collided, { a: entityA, b: entityB });
        }
      }
    }
  }

  /**
   * @param {import("../components/position.js").Position} posA
   * @param {import("../components/size.js").Size} sizeA
   * @param {import("../components/position.js").Position} posB
   * @param {import("../components/size.js").Size} sizeB
   * @returns {boolean}
   */
  areEntitiesColliding(posA, sizeA, posB, sizeB) {
    return (
      posA.x < posB.x + sizeB.x &&
      posA.x + sizeA.x > posB.x &&
      posA.y < posB.y + sizeB.y &&
      posA.y + sizeA.y > posB.y
    );
  }
}
