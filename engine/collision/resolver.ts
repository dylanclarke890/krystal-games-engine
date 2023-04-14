import { Bounciness } from "../components/index.js";
import { EntityManager } from "../entities/entity-manager.js";
import { Viewport } from "../graphics/viewport.js";
import { Assert } from "../utils/assert.js";
import { DetectionResult } from "../utils/types.js";

const sides = { LEFT: 0, TOP: 1, RIGHT: 2, BOTTOM: 3 };

export class CollisionResolver {
  entityManager: EntityManager;
  viewport: Viewport;

  static defaultComponents = {
    bounce: new Bounciness(1),
  };

  constructor(entityManager: EntityManager, viewport: Viewport) {
    Assert.instanceOf("entityManager", entityManager, EntityManager);
    Assert.instanceOf("viewport", viewport, Viewport);
    this.entityManager = entityManager;
    this.viewport = viewport;
  }

  resolve(collided: DetectionResult) {
    const em = this.entityManager;
    collided.viewportCollisions.forEach((v) => {
      const [entity, viewportCollisions] = v;
      const pos = em.getComponent(entity, "Position")!;
      const size = em.getComponent(entity, "Size")!;
      if (viewportCollisions.left) {
        pos.x = 0;
      }
      if (viewportCollisions.right) {
        pos.x = this.viewport.width - size.x;
      }
      if (viewportCollisions.top) {
        pos.y = 0;
      }
      if (viewportCollisions.bottom) {
        pos.y = this.viewport.height - size.y;
      }
    });
    collided.entityCollisions.forEach((v) => {
      const [a, b] = v;
      // Get components
      const posA = em.getComponent(a, "Position")!;
      const posB = em.getComponent(b, "Position")!;
      const velA = em.getComponent(a, "Velocity")!;
      const velB = em.getComponent(b, "Velocity")!;
      const sizeA = em.getComponent(a, "Size")!;
      const sizeB = em.getComponent(b, "Size")!;
      // const collisionA = em.getComponent(a, "Collision")!;
      // const collisionB = em.getComponent(b, "Collision")!;

      const bDefault = CollisionResolver.defaultComponents.bounce;
      const bounceA = em.getComponent(a, "Bounciness") ?? bDefault;
      const bounceB = em.getComponent(b, "Bounciness") ?? bDefault;

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

      /** The side of A that was collided with. */
      let side: typeof sides[keyof typeof sides];
      if (absDX > absDY) side = dx > 0 ? sides.RIGHT : sides.LEFT;
      else side = dy > 0 ? sides.BOTTOM : sides.TOP;

      switch (side) {
        case sides.LEFT:
          {
            const vRel = velA.x - velB.x;
            velA.x = -vRel * bounceA.value + velA.x;
            velB.x = vRel * bounceB.value + velB.x;

            const overlap = posA.x + sizeA.x - posB.x;
            posA.x -= overlap;
            posB.x += overlap;
          }
          break;
        case sides.RIGHT:
          {
            const vRel = velA.x - velB.x;
            velA.x = -vRel * bounceA.value + velA.x;
            velB.x = vRel * bounceB.value + velB.x;

            const overlap = posB.x + sizeB.x - posA.x;
            posA.x += overlap;
            posB.x -= overlap;
          }
          break;
        case sides.TOP:
          {
            const vRel = velA.y - velB.y;
            velA.y = -vRel * bounceA.value + velA.y;
            velB.y = vRel * bounceB.value + velB.y;

            const overlap = posA.y + sizeA.y - posB.y;
            posA.y -= overlap;
            posB.y += overlap;
          }
          break;
        case sides.BOTTOM:
          {
            const vRel = velA.y - velB.y;
            velA.y = -vRel * bounceA.value + velA.y;
            velB.y = vRel * bounceB.value + velB.y;

            const overlap = posB.y + sizeB.y - posA.y;
            posA.y += overlap;
            posB.y -= overlap;
          }
          break;
        default:
          break;
      }
    });
  }

  resolveElastic(player: any, entity: any) {
    const STICKY_THRESHOLD = 0.004;
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
