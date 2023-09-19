import { Position, Size } from "../components/index.js";
import { EntityManager } from "../entities/entity-manager.js";
import { Viewport } from "../graphics/viewport.js";
import { Assert } from "../utils/assert.js";
import { PairedSet } from "../utils/paired-set.js";
import { Collidable, ComponentType } from "../utils/types.js";

export class CollisionDetector {
  static components: ComponentType[] = ["Size"];

  entityManager: EntityManager;
  viewport: Viewport;
  entityCollisions: PairedSet<number>;
  viewportCollisions: Set<number>;

  constructor(entityManager: EntityManager, viewport: Viewport) {
    Assert.instanceOf("entityManager", entityManager, EntityManager);
    Assert.instanceOf("viewport", viewport, Viewport);
    this.entityManager = entityManager;
    this.viewport = viewport;
    this.entityCollisions = new PairedSet();
    this.viewportCollisions = new Set();
  }

  detect(collidables: Collidable[]) {
    this.entityCollisions.clear();
    this.viewportCollisions.clear();

    for (let i = 0; i < collidables.length; i++) {
      const [a, posA, collisionA] = collidables[i];
      const entityA = this.entityManager.getComponents(a, CollisionDetector.components);

      if (this.viewportCollisionCheck(posA, entityA.Size!)) {
        this.viewportCollisions.add(a);
      }

      for (let j = 0; j < collidables.length; j++) {
        const [b, posB, collisionB] = collidables[j];

        if (a === b || collisionA.collisionLayer !== collisionB.collisionLayer) {
          continue;
        }

        const entityB = this.entityManager.getComponents(b, CollisionDetector.components);
        if (this.AABBCollisionCheck(posA, entityA.Size!, posB, entityB.Size!)) {
          this.entityCollisions.add(a, b);
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
