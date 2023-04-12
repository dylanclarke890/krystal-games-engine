import { EntityManager } from "../entities/entity-manager.js";
import { Guard } from "../utils/guard.js";
import { PairedSet } from "../utils/paired-set.js";

const STICKY_THRESHOLD = 0.004;

export class CollisionResolver {
  entityManager: EntityManager;

  constructor(entityManager: EntityManager) {
    Guard.againstNull({ entityManager }).isInstanceOf(EntityManager);
    this.entityManager = entityManager;
  }

  resolve(collided: PairedSet<number>) {
    if (!collided.length) return;
    const em = this.entityManager;
    collided.forEach((v) => {
      const [a, b] = v;
      // Get components - should all be present to get to this point, no need to check nulls
      const posA = em.getComponent(a, "Position")!;
      const posB = em.getComponent(b, "Position")!;
      const velA = em.getComponent(a, "Velocity")!;
      const velB = em.getComponent(b, "Velocity")!;
      const sizeA = em.getComponent(a, "Size")!;
      const sizeB = em.getComponent(b, "Size")!;
      // const collisionA = em.getComponent(a, "Collision")!;
      // const collisionB = em.getComponent(b, "Collision")!;

      // Get midpoints
      const aMidX = posA.x + sizeA.halfX;
      const aMidY = posA.y + sizeA.halfY;
      const bMidX = posB.x + sizeB.halfX;
      const bMidY = posB.y + sizeB.halfY;

      // Find side of entry based on the normalized sides
      const dx = (aMidX - bMidX) / (sizeA.halfX + sizeB.halfX);
      const dy = (aMidY - bMidY) / (sizeA.halfY + sizeB.halfY);
      // Calculate the absolute differences in the x and y coordinates
      const absDX = Math.abs(dx);
      const absDY = Math.abs(dy);

      const sides = { LEFT: 0, TOP: 1, RIGHT: 2, BOTTOM: 3 };
      let side: typeof sides[keyof typeof sides];
      if (absDX > absDY) side = dx > 0 ? sides.RIGHT : sides.LEFT;
      else side = dy > 0 ? sides.BOTTOM : sides.TOP;
    });
  }

  resolveElastic(player: any, entity: any) {
    // Find the mid points of the entity and player
    var pMidX = player.getMidX();
    var pMidY = player.getMidY();
    var aMidX = entity.getMidX();
    var aMidY = entity.getMidY();

    // To find the side of entry calculate based on
    // the normalized sides
    var dx = (aMidX - pMidX) / entity.halfWidth;
    var dy = (aMidY - pMidY) / entity.halfHeight;

    // Calculate the absolute change in x and y
    var absDX = Math.abs(dx);
    var absDY = Math.abs(dy);

    // If the distance between the normalized x and y
    // position is less than a small threshold (.1 in this case)
    // then this object is approaching from a corner
    if (Math.abs(absDX - absDY) < 0.1) {
      // If the player is approaching from positive X
      if (dx < 0) {
        // Set the player x to the right side
        player.x = entity.getRight();

        // If the player is approaching from negative X
      } else {
        // Set the player x to the left side
        player.x = entity.getLeft() - player.width;
      }

      // If the player is approaching from positive Y
      if (dy < 0) {
        // Set the player y to the bottom
        player.y = entity.getBottom();

        // If the player is approaching from negative Y
      } else {
        // Set the player y to the top
        player.y = entity.getTop() - player.height;
      }

      // Randomly select a x/y direction to reflect velocity on
      if (Math.random() < 0.5) {
        // Reflect the velocity at a reduced rate
        player.vx = -player.vx * entity.restitution;

        // If the object's velocity is nearing 0, set it to 0
        if (Math.abs(player.vx) < STICKY_THRESHOLD) {
          player.vx = 0;
        }
      } else {
        player.vy = -player.vy * entity.restitution;
        if (Math.abs(player.vy) < STICKY_THRESHOLD) {
          player.vy = 0;
        }
      }

      // If the object is approaching from the sides
    } else if (absDX > absDY) {
      // If the player is approaching from positive X
      if (dx < 0) {
        player.x = entity.getRight();
      } else {
        // If the player is approaching from negative X
        player.x = entity.getLeft() - player.width;
      }

      // Velocity component
      player.vx = -player.vx * entity.restitution;

      if (Math.abs(player.vx) < STICKY_THRESHOLD) {
        player.vx = 0;
      }

      // If this collision is coming from the top or bottom more
    } else {
      // If the player is approaching from positive Y
      if (dy < 0) {
        player.y = entity.getBottom();
      } else {
        // If the player is approaching from negative Y
        player.y = entity.getTop() - player.height;
      }

      // Velocity component
      player.vy = -player.vy * entity.restitution;
      if (Math.abs(player.vy) < STICKY_THRESHOLD) {
        player.vy = 0;
      }
    }
  }
}
