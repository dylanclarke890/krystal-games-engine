import { Assert } from "./assert.js";
import { Enum } from "./enum.js";
import { Vector2D } from "./maths/vector-2d.js";

class Quadrant extends Enum {
  static NorthWest = new Quadrant();
  static NorthEast = new Quadrant();
  static SouthWest = new Quadrant();
  static SouthEast = new Quadrant();

  static {
    this.freeze();
  }
}

export class Quadtree {
  /** The node representing the entire viewport/bounds. */
  root: QuadtreeNode;
  size: number;

  /**
   * @param position Vector with x, y properties representing the top left position of the bounds.
   * @param size Vector with x, y properties representing the size of the bounds.
   * @param maxDepth The maximum number of levels that the quadtree will create. Default is 4.
   * @param maxChildren The maximum number of items per quadrant before subdividing. Default is 4.
   **/
  constructor(position: Vector2D, size: Vector2D, { maxDepth = 4, maxChildren = 4 } = {}) {
    Assert.instanceOf("position", position, Vector2D);
    Assert.instanceOf("size", size, Vector2D);

    this.size = 0;
    this.root = new QuadtreeNode(position, size, 0, maxDepth, maxChildren);
  }

  insert(node: QuadtreeNode | QuadtreeNode[]) {
    if (Array.isArray(node)) {
      this.size += node.length;
      this.root.insert(node);
    } else {
      this.size++;
      this.root.insert(node);
    }
  }

  clear() {
    this.root.clear();
    this.size = 0;
  }

  retrieve(node: QuadtreeNode) {
    return this.root.retrieve(node);
  }
}

export class QuadtreeNode {
  bounds: { position: Vector2D; size: Vector2D };

  #nodes: QuadtreeNode[];

  #children: QuadtreeNode[];
  #overlappingChildren: QuadtreeNode[];
  #maxChildren: number;

  #depth: number;
  #maxDepth: number;

  constructor(position: Vector2D, size: Vector2D, depth = 0, maxDepth = 4, maxChildren = 4) {
    this.bounds = { position, size };
    this.#depth = depth;
    this.#maxChildren = maxChildren;
    this.#maxDepth = maxDepth;
    this.#nodes = [];
    this.#children = [];
    this.#overlappingChildren = [];
  }

  insert(node: QuadtreeNode | QuadtreeNode[]) {
    if (Array.isArray(node)) {
      node.forEach((n) => this.insert(n));
      return;
    }

    if (this.#children.length) {
      const quadrant = this.findQuadrant(node);
      const index = quadrant.valueOf();

      if (this.isInBounds(node, this.#children[index])) {
        this.#children[index].insert(node);
      } else {
        this.#overlappingChildren.push(node);
      }
      return;
    }

    this.#nodes.push(node);

    if (this.#nodes.length > this.#maxChildren && this.#depth < this.#maxDepth) {
      this.subdivide();
    }
  }

  retrieve(node: QuadtreeNode): QuadtreeNode[] {
    // If this node is subdivided
    if (this.#children.length) {
      const quadrant = this.findQuadrant(node);
      const index = quadrant.valueOf();

      return this.#children[index].retrieve(node).concat(this.#overlappingChildren);
    }

    return this.#nodes;
  }

  subdivide() {
    const halfWidth = this.bounds.size.x / 2;
    const halfHeight = this.bounds.size.y / 2;

    // Positions of the children quadrants
    const positions = [
      new Vector2D(this.bounds.position.x, this.bounds.position.y), // NW
      new Vector2D(this.bounds.position.x + halfWidth, this.bounds.position.y), // NE
      new Vector2D(this.bounds.position.x, this.bounds.position.y + halfHeight), // SW
      new Vector2D(this.bounds.position.x + halfWidth, this.bounds.position.y + halfHeight), // SE
    ];

    const size = new Vector2D(halfWidth, halfHeight);

    this.#children = positions.map(
      (pos) => new QuadtreeNode(pos, size, this.#depth + 1, this.#maxDepth, this.#maxChildren)
    );

    const nodes = [...this.#nodes];
    this.#nodes.length = 0;
    this.insert(nodes);
  }

  clear() {
    this.#children.length = 0;
    this.#overlappingChildren.length = 0;
    this.#nodes.forEach((n) => n.clear());
    this.#nodes.length = 0;
  }

  findQuadrant(node: QuadtreeNode): Quadrant {
    const left = node.bounds.position.x < this.bounds.position.x + this.bounds.size.x / 2;
    const top = node.bounds.position.y < this.bounds.position.y + this.bounds.size.y / 2;

    if (left) {
      return top ? Quadrant.NorthWest : Quadrant.SouthWest;
    }

    return top ? Quadrant.NorthEast : Quadrant.SouthEast;
  }

  isInBounds(a: QuadtreeNode, b: QuadtreeNode): boolean {
    return (
      a.bounds.position.x >= b.bounds.position.x &&
      a.bounds.position.x + a.bounds.size.x <= b.bounds.position.x + b.bounds.size.x &&
      a.bounds.position.y >= b.bounds.position.y &&
      a.bounds.position.y + a.bounds.size.y <= b.bounds.position.y + b.bounds.size.y
    );
  }
}

