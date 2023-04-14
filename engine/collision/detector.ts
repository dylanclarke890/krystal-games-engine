import { Collision, Position, Size } from "../components/index.js";
import { EntityManager } from "../entities/entity-manager.js";
import { Viewport } from "../graphics/viewport.js";
import { Assert } from "../utils/assert.js";
import { PairedSet } from "../utils/paired-set.js";
import { DetectionResult, ViewportCollision, Collidable } from "../utils/types.js";

export class CollisionDetector {
  entityManager: EntityManager;
  viewport: Viewport;
  pairedSet: PairedSet<number>;
  viewportCollisions: ViewportCollision[];

  constructor(entityManager: EntityManager, viewport: Viewport) {
    Assert.instanceOf("entityManager", entityManager, EntityManager);
    Assert.instanceOf("viewport", viewport, Viewport);
    this.entityManager = entityManager;
    this.viewport = viewport;
    this.pairedSet = new PairedSet();
    this.viewportCollisions = [];
  }

  detectEntityCollision(a: number, posA: Position, sizeA: Size, collidables: Collidable[]): void {
    for (let j = 0; j < collidables.length; j++) {
      const [b, posB, collisionB] = collidables[j];
      if (a === b || collisionB.hasEntityCollisionType("IGNORE")) continue;
      const sizeB = this.entityManager.getComponent(b, "Size")!;
      if (this.AABBCollisionCheck(posA, sizeA, posB, sizeB)) {
        this.pairedSet.add([a, b]);
      }
    }
  }

  detectViewportCollision(a: number, pos: Position, size: Size, collision: Collision): void {
    let add = false;
    const res = { left: false, right: false, top: false, bottom: false };

    if (collision.hasViewportCollisionType("LEFT")) {
      add ||= res.left = pos.x < 0;
    }

    if (collision.hasViewportCollisionType("RIGHT")) {
      add ||= res.right = pos.x + size.x > this.viewport.width;
    }

    if (collision.hasViewportCollisionType("TOP")) {
      add ||= res.top = pos.y < 0;
    }

    if (collision.hasViewportCollisionType("BOTTOM")) {
      add ||= res.bottom = pos.y + size.y > this.viewport.height;
    }

    if (add) {
      this.viewportCollisions.push([a, res]);
    }
  }

  detect(collidables: Collidable[]): DetectionResult {
    const em = this.entityManager;
    this.pairedSet.clear();
    this.viewportCollisions.length = 0;

    for (let i = 0; i < collidables.length; i++) {
      const [a, posA, collisionA] = collidables[i];
      const sizeA = em.getComponent(a, "Size")!;
      if (!collisionA.hasEntityCollisionType("IGNORE")) {
        this.detectEntityCollision(a, posA, sizeA, collidables);
      }
      if (!collisionA.hasViewportCollisionType("IGNORE")) {
        this.detectViewportCollision(a, posA, sizeA, collisionA);
      }
    }

    return { entityCollisions: this.pairedSet, viewportCollisions: this.viewportCollisions };
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
