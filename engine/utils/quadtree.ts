import { Assert } from "./assert.js";
import { Vector2D } from "./maths/vector-2d.js";

enum Quadrant {
  NorthWest,
  NorthEast,
  SouthWest,
  SouthEast,
}

export class PointNode {
  bounds: { position: Vector2D; size: Vector2D };
  nodes: PointNode[];
  children: PointNode[];
  maxChildren: number;
  depth: number;
  maxDepth: number;

  constructor(position: Vector2D, size: Vector2D, depth = 0, maxDepth = 4, maxChildren = 4) {
    this.bounds = { position, size };
    this.depth = depth;
    this.maxChildren = maxChildren;
    this.maxDepth = maxDepth;
    this.nodes = [];
    this.children = [];
  }

  insert(node: PointNode | PointNode[]) {
    if (Array.isArray(node)) {
      node.forEach((n) => this.insert(n));
      return;
    }

    if (this.children.length) {
      const quadrant = this.findQuadrant(node);
      this.children[quadrant].insert(node);
      return;
    }

    this.nodes.push(node);

    if (this.nodes.length > this.maxChildren && this.depth < this.maxDepth) {
      this.subdivide();
    }
  }

  retrieve(node: PointNode): PointNode[] {
    // If this node is subdivided
    if (this.children.length) {
      const quadrant = this.findQuadrant(node);
      return this.children[quadrant].retrieve(node);
    }

    return this.nodes;
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

    this.children = positions.map((pos) => new PointNode(pos, size, this.depth + 1, this.maxDepth, this.maxChildren));

    const nodes = [...this.nodes];
    this.nodes.length = 0;
    this.insert(nodes);
  }

  clear() {
    this.children.length = 0;
    this.nodes.forEach((n) => n.clear());
    this.nodes.length = 0;
  }

  findQuadrant(node: PointNode): Quadrant {
    const left = node.bounds.position.x < this.bounds.position.x + this.bounds.size.x / 2;
    const top = node.bounds.position.y < this.bounds.position.y + this.bounds.size.y / 2;

    if (left) {
      return top ? Quadrant.NorthWest : Quadrant.SouthWest;
    }

    return top ? Quadrant.NorthEast : Quadrant.SouthEast;
  }
}

export class BoundsNode extends PointNode {
  #overlappingChildren: BoundsNode[];

  constructor(position: Vector2D, size: Vector2D, depth = 0, maxDepth = 4, maxChildren = 4) {
    super(position, size, depth, maxDepth, maxChildren);
    this.#overlappingChildren = [];
  }

  insert(node: BoundsNode | BoundsNode[]) {
    if (Array.isArray(node)) {
      node.forEach((n) => this.insert(n));
      return;
    }

    if (this.children.length) {
      const quadrant = this.findQuadrant(node);

      if (this.isInBounds(node, this.children[quadrant])) {
        this.children[quadrant].insert(node);
      } else {
        this.#overlappingChildren.push(node);
      }
      return;
    }

    super.insert(node);
  }

  retrieve(item: BoundsNode): PointNode[] {
    return super.retrieve(item).concat(this.#overlappingChildren);
  }

  clear() {
    this.#overlappingChildren.length = 0;
    super.clear();
  }

  isInBounds(a: PointNode, b: PointNode): boolean {
    return (
      a.bounds.position.x >= b.bounds.position.x &&
      a.bounds.position.x + a.bounds.size.x <= b.bounds.position.x + b.bounds.size.x &&
      a.bounds.position.y >= b.bounds.position.y &&
      a.bounds.position.y + a.bounds.size.y <= b.bounds.position.y + b.bounds.size.y
    );
  }
}

/** A 2d spatial subdivision algorithm data structure. */
export class Quadtree {
  /** The node representing the entire viewport/bounds. */
  root: INode;
  size: number;

  /**
   * @param position Vector with x, y properties representing the top left position of the bounds.
   * @param size Vector with x, y properties representing the size of the bounds.
   * @param maxDepth The maximum number of levels that the quadtree will create. Default is 4.
   * @param maxChildren The maximum number of items per quadrant before subdividing. Default is 4.
   * @param pointQuad Whether the QuadTree will contain points, or items with bounds. Default value is false.
   **/
  constructor(position: Vector2D, size: Vector2D, { maxDepth = 4, maxChildren = 4, pointQuad = false } = {}) {
    Assert.instanceOf("position", position, Vector2D);
    Assert.instanceOf("size", size, Vector2D);

    this.size = 0;
    this.root = new (pointQuad ? PointNode : BoundsNode)(position, size, 0, maxDepth, maxChildren);
  }

  insert(value: INode | INode[]) {
    if (Array.isArray(value)) {
      this.size += value.length;
      value.forEach((item) => this.root.insert(item));
    } else {
      this.size++;
      this.root.insert(value);
    }
  }

  clear() {
    this.root.clear();
    this.size = 0;
  }

  retrieve(value: INode) {
    return this.root.retrieve(value);
  }
}
