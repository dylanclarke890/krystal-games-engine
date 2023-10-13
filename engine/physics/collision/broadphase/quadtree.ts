import { IBroadphase } from "../../../types/common-interfaces.js";
import { Vector2 } from "../../../maths/vector2.js";
import { GameContext } from "../../../core/context.js";
import { AABB } from "../../../maths/aabb.js";
import { Quadrant } from "../../../constants/enums.js";
import { ColliderEntity } from "../data.js";

export class Quadtree implements IBroadphase {
  context: GameContext;
  root: QuadtreeNode;

  constructor(context: GameContext) {
    this.context = context;

    const position = new Vector2(0, 0);
    const size = new Vector2(this.context.viewport.width, this.context.viewport.height);
    this.root = new QuadtreeNode(position, size, 0);
  }

  add(entity: ColliderEntity): void {
    this.root.insert(entity);
  }

  computePairs(): Pair<ColliderEntity>[] {
    const collisions: Pair<ColliderEntity>[] = [];
    const quadrantsToCheck = [this.root];

    while (quadrantsToCheck.length) {
      const currentQuadrant = quadrantsToCheck.pop()!;

      if (currentQuadrant.quadrants.length) {
        quadrantsToCheck.push(...currentQuadrant.quadrants);
        continue;
      }
      if (currentQuadrant.entities.length <= 1) {
        continue;
      }

      // This is the deepest quadrant in this branch, Compare the entities for collisions.
      for (const a of currentQuadrant.entities) {
        for (const b of currentQuadrant.entities) {
          if (a !== b && a.collider.aabb.intersects(b.collider.aabb)) {
            collisions.push([a, b]);
          }
        }
      }
    }

    return collisions;
  }

  pick(point: Vector2): Nullable<ColliderEntity> {
    const quadrantsToCheck = [this.root];

    while (quadrantsToCheck.length) {
      const currentQuadrant = quadrantsToCheck.pop()!;

      if (currentQuadrant.contains(point)) {
        if (currentQuadrant.quadrants.length) {
          quadrantsToCheck.push(...currentQuadrant.quadrants);
          continue;
        }

        // This is the deepest quadrant in this branch, search the nodes.
        return currentQuadrant.entities.find((node) => node.collider.aabb.contains(point));
      }
    }

    return undefined;
  }

  query(aabb: AABB, output: ColliderEntity[]): void {
    const quadrantsToCheck = [this.root];

    while (quadrantsToCheck.length) {
      const currentQuadrant = quadrantsToCheck.pop()!;
      if (!currentQuadrant.intersects(aabb)) {
        continue;
      }

      if (currentQuadrant.quadrants.length) {
        quadrantsToCheck.push(...currentQuadrant.quadrants);
        continue;
      }

      // This is the deepest level the aabb fits into, go through colliders and add them to the output array.
      for (const entity of currentQuadrant.entities) {
        if (entity.collider.aabb.intersects(aabb)) {
          output.push(entity);
        }
      }
    }
  }

  clear(): void {
    this.root.clear();
  }

  draw(color?: string): void {
    this.context.viewport.ctx.strokeStyle = color ?? "white";
    this.root.draw(this.context.viewport.ctx);
  }
}

class QuadtreeNode {
  static MAX_NODES = 5;
  static MAX_DEPTH = 15;

  position: Vector2;
  size: Vector2;

  quadrants: QuadtreeNode[];
  entities: ColliderEntity[];
  depth: number;

  constructor(position: Vector2, size: Vector2, depth: number) {
    this.position = position;
    this.size = size;
    this.depth = depth;
    this.quadrants = [];
    this.entities = [];
  }

  findQuadrant(aabb: AABB): Quadrant {
    const centerX = aabb.minX + (aabb.maxX - aabb.minX) / 2;
    const centerY = aabb.minY + (aabb.maxY - aabb.minY) / 2;

    const left = centerX < this.position.x + this.size.x / 2;
    const top = centerY < this.position.y + this.size.y / 2;

    if (left) {
      return top ? Quadrant.NorthWest : Quadrant.SouthWest;
    }

    return top ? Quadrant.NorthEast : Quadrant.SouthEast;
  }

  subdivide(): void {
    const size = this.size.clone().divScalar(2);

    const quadrantPositions = [
      this.position.clone(), // NW
      new Vector2(this.position.x + size.x, this.position.y), // NE
      new Vector2(this.position.x, this.position.y + size.y), // SW
      this.position.clone().add(size), // SE
    ];

    this.quadrants = quadrantPositions.map((pos) => new QuadtreeNode(pos, size, this.depth + 1));
  }

  insert(entity: ColliderEntity): void {
    if (this.quadrants.length) {
      const quadrant = this.findQuadrant(entity.collider.aabb).valueOf();
      this.quadrants[quadrant].insert(entity);
      return;
    }

    this.entities.push(entity);

    if (
      this.entities.length > QuadtreeNode.MAX_NODES &&
      this.depth < QuadtreeNode.MAX_DEPTH &&
      !this.quadrants.length
    ) {
      this.subdivide();
      // After subdividing, re-insert the nodes
      while (this.entities.length) {
        const node = this.entities.pop()!;
        this.insert(node);
      }
    }
  }

  clear(): void {
    for (const quadrant of this.quadrants) {
      quadrant.clear();
    }

    this.entities = [];
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.strokeRect(this.position.x, this.position.y, this.size.x, this.size.y);
    for (const quadrant of this.quadrants) {
      quadrant.draw(ctx);
    }
  }

  intersects(aabb: AABB): boolean {
    return (
      this.position.x <= aabb.minX &&
      this.position.x + this.size.x >= aabb.maxX &&
      this.position.y <= aabb.minY &&
      this.position.y + this.size.y >= aabb.maxY
    );
  }

  contains(point: Vector2): boolean {
    return (
      this.position.x <= point.x &&
      this.position.x + this.size.x >= point.x &&
      this.position.y <= point.y &&
      this.position.y + this.size.y >= point.y
    );
  }
}
