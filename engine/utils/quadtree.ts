import { Assert } from "./assert.js";
import { Vector2D } from "./maths/vector-2d.js";

enum QuadtreeSegments {
  TOP_LEFT,
  TOP_RIGHT,
  BOTTOM_LEFT,
  BOTTOM_RIGHT,
}

class QuadtreeNode {
  bounds: { position: Vector2D; size: Vector2D };
  nodes: QuadtreeNode[];
  children: QuadtreeNode[];
  maxChildren: number;
  depth: number;
  maxDepth: number;

  constructor(position: Vector2D, size: Vector2D, depth: number, maxDepth?: number, maxChildren?: number) {
    this.bounds = { position, size };
    this.depth = depth;
    this.maxChildren = maxChildren ?? 4;
    this.maxDepth = maxDepth ?? 4;
    this.nodes = [];
    this.children = [];
  }

  insert(item: QuadtreeNode) {
    if (this.nodes.length > 0) {
      const index = this.findIndex(item);
      this.nodes[index].insert(item);
      return;
    }

    this.children.push(item);

    if (this.depth < this.maxDepth && this.children.length > this.maxChildren) {
      this.subdivide();
      this.children.forEach(this.insert, this);
      this.children.length = 0;
    }
  }

  retrieve(item: QuadtreeNode): QuadtreeNode[] {
    if (this.nodes.length > 0) {
      const index = this.findIndex(item);
      return this.nodes[index].retrieve(item);
    }
    return this.children;
  }

  findIndex(item: QuadtreeNode) {
    const left = item.bounds.position.x > this.bounds.position.x + this.bounds.size.x / 2 ? false : true;
    const top = item.bounds.position.y > this.bounds.position.y + this.bounds.position.y / 2 ? false : true;

    if (left) {
      return top ? QuadtreeSegments.TOP_LEFT : QuadtreeSegments.BOTTOM_LEFT;
    }

    return top ? QuadtreeSegments.TOP_RIGHT : QuadtreeSegments.BOTTOM_RIGHT;
  }

  #newNode = (position: Vector2D, size: Vector2D) =>
    new QuadtreeNode(position, size, this.depth, this.maxDepth, this.maxChildren);

  subdivide() {
    this.depth++;

    const size = new Vector2D(this.bounds.size.x / 2, this.bounds.size.y / 2);
    const topLeftPosition = new Vector2D(this.bounds.position.x, this.bounds.position.y);
    const topRightPosition = topLeftPosition.clone().add(size.x, 0);
    const bottomLeftPosition = topLeftPosition.clone().add(0, size.y);
    const bottomRightPosition = topLeftPosition.clone().add(size.x, size.y);

    this.nodes[QuadtreeSegments.TOP_LEFT] = this.#newNode(topLeftPosition, size);
    this.nodes[QuadtreeSegments.TOP_RIGHT] = this.#newNode(topRightPosition, size);
    this.nodes[QuadtreeSegments.BOTTOM_LEFT] = this.#newNode(bottomLeftPosition, size);
    this.nodes[QuadtreeSegments.BOTTOM_RIGHT] = this.#newNode(bottomRightPosition, size);
  }

  clear() {
    this.children.length = 0;
    this.nodes.forEach((n) => n.clear());
    this.nodes.length = 0;
  }
}

export class BoundsNode extends QuadtreeNode {
  #stuckChildren: BoundsNode[];

  constructor(position: Vector2D, size: Vector2D, depth: number, maxDepth?: number, maxChildren?: number) {
    super(position, size, depth, maxDepth, maxChildren);
    this.#stuckChildren = [];
  }

  isInBounds(a: QuadtreeNode, b: QuadtreeNode): boolean {
    return (
      a.bounds.position.x >= b.bounds.position.x &&
      a.bounds.position.x + a.bounds.size.x <= b.bounds.position.x + b.bounds.size.x &&
      a.bounds.position.y >= b.bounds.position.y &&
      a.bounds.position.y + a.bounds.size.y <= b.bounds.position.y + b.bounds.size.y
    );
  }

  insert(item: BoundsNode) {
    if (this.nodes.length) {
      const index = this.findIndex(item);
      const node = this.nodes[index];

      if (this.isInBounds(item, node)) {
        this.nodes[index].insert(item);
      } else {
        this.#stuckChildren.push(item);
      }

      return;
    }

    this.children.push(item);

    if (this.depth < this.maxDepth && this.children.length > this.maxChildren) {
      this.subdivide();
      this.children.forEach((c) => this.insert(c as BoundsNode));
      this.children.length = 0;
    }
  }

  getChildren() {
    return [...this.children, ...this.#stuckChildren];
  }

  retrieve(item: BoundsNode) {
    const found: BoundsNode[] = [];

    if (this.nodes.length > 0) {
      const index = this.findIndex(item);
      const node = this.nodes[index];

      if (this.isInBounds(item, node)) {
        found.push(...(this.nodes[index].retrieve(item) as BoundsNode[]));
      } else {
        // Part of the item are overlapping multiple child nodes. For each of the overlapping nodes,
        // return all containing objects.
        if (item.bounds.position.x <= this.nodes[QuadtreeSegments.TOP_RIGHT].bounds.position.x) {
          if (item.bounds.position.y <= this.nodes[QuadtreeSegments.BOTTOM_LEFT].bounds.position.y) {
            found.push(...(this.nodes[QuadtreeSegments.TOP_LEFT] as BoundsNode).getAllContent());
          }

          if (
            item.bounds.position.y + item.bounds.size.y >
            this.nodes[QuadtreeSegments.BOTTOM_LEFT].bounds.position.y
          ) {
            found.push(...(this.nodes[QuadtreeSegments.BOTTOM_LEFT] as BoundsNode).getAllContent());
          }
        }

        if (
          item.bounds.position.x + item.bounds.position.x >
          this.nodes[QuadtreeSegments.TOP_RIGHT].bounds.position.x
        ) {
          if (item.bounds.position.y <= this.nodes[QuadtreeSegments.BOTTOM_RIGHT].bounds.position.y) {
            found.push(...(this.nodes[QuadtreeSegments.TOP_RIGHT] as BoundsNode).getAllContent());
          }

          if (
            item.bounds.position.y + item.bounds.size.y >
            this.nodes[QuadtreeSegments.BOTTOM_RIGHT].bounds.position.y
          ) {
            found.push(...(this.nodes[QuadtreeSegments.BOTTOM_RIGHT] as BoundsNode).getAllContent());
          }
        }
      }
    }

    found.push(...this.#stuckChildren);
    found.push(...(this.children as BoundsNode[]));

    return found;
  }

  getAllContent(): BoundsNode[] {
    const content: BoundsNode[] = [];

    content.push(...(this.children as BoundsNode[]));
    content.push(...this.#stuckChildren);

    this.nodes.forEach((node) => {
      content.push(...(node as BoundsNode).getAllContent());
    });

    return content;
  }

  clear() {
    this.#stuckChildren.length = 0;
    this.children.length = 0;
    this.nodes.forEach((n) => n.clear());
    this.nodes.length = 0;
  }
}

/** A 2d spatial subdivision algorithm. */
export class Quadtree<TNode = QuadtreeNode | BoundsNode> {
  position: Vector2D;
  size: Vector2D;
  /** The maximum number of levels that the quadtree will create. Default is 4. */
  maxDepth: number;
  /** The maximum number of children that a node can contain before it is split into sub-nodes. Default is 4. */
  maxChildren: number;

  /** The node representing the entire viewport. */
  root: TNode;

  /**
   * @param {boolean} pointQuad Whether the QuadTree will contain points, or items with bounds. Default value is false.
   **/
  constructor(position: Vector2D, size: Vector2D, maxDepth: number, maxChildren: number, pointQuad?: boolean) {
    Assert.instanceOf("position", position, Vector2D);
    Assert.instanceOf("size", size, Vector2D);
    Assert.number("maxDepth", maxDepth);
    Assert.number("size", maxChildren);

    this.position = position;
    this.size = size;
    this.maxDepth = maxDepth;
    this.maxChildren = maxChildren;

    this.root = (pointQuad
      ? new QuadtreeNode(position, size, 0, maxDepth, maxChildren)
      : new BoundsNode(position, size, 0, maxDepth, maxChildren)) as unknown as TNode;
  }

  insert(value: TNode | TNode[]) {
    if (Array.isArray(value)) value.forEach((item) => this.root.insert(item));
    else this.root.insert(value);
  }

  clear() {
    this.root.clear();
  }

  retrieve(value: TNode) {
    return [...this.root.retrieve(value)];
  }
}
