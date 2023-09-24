import { Quadrant } from "../constants/enums.js";
import { Viewport } from "../graphics/viewport.js";
import { IObjectPool, IObjectPoolManager } from "../types/common-interfaces.js";
import { Vector2D } from "../utils/maths/vector-2d.js";

export class Quadtree {
  /** The node representing the entire viewport/bounds. */
  root: QuadtreeNode;
  size: number;

  viewport: Viewport;

  nodePool: IObjectPool<QuadtreeNode>;

  /**
   * @param maxDepth The maximum number of levels that the quadtree will create. Default is 4.
   * @param maxChildren The maximum number of items per quadrant before subdividing. Default is 4.
   **/
  constructor(viewport: Viewport, objectPoolManager: IObjectPoolManager, { maxDepth = 4, maxChildren = 4 } = {}) {
    this.size = 0;
    this.viewport = viewport;
    this.nodePool = objectPoolManager.create(
      "quadtree",
      (id, position, size, depth, maxDepth, maxChildren) =>
        new QuadtreeNode(id, position, size, depth, maxDepth, maxChildren)
    );

    const pos = new Vector2D(0, 0);
    const size = new Vector2D(viewport.width, viewport.height);
    this.root = this.nodePool.acquire(-1, pos, size, 0, maxDepth, maxChildren);
  }

  insert(id: number, position: Vector2D, size: Vector2D): void {
    const node = new QuadtreeNode(id, position, size);
    this.size++;
    this.root.insert(node);
  }

  retrieve(position: Vector2D, size: Vector2D): QuadtreeNode[] {
    const node = new QuadtreeNode(-1, position, size);
    return this.root.retrieve(node);
  }

  retrieveById(id: number, node: QuadtreeNode = this.root): Nullable<QuadtreeNode> {
    if (node.id === id) {
      return node;
    }

    // If the node has children, search them
    for (let child of node.children) {
      const foundNode = this.retrieveById(id, child);
      if (foundNode) {
        return foundNode;
      }
    }

    // If the node has overlapping children, search them as well
    for (let overlappingChild of node.overlappingChildren) {
      const foundNode = this.retrieveById(id, overlappingChild);
      if (foundNode) {
        return foundNode;
      }
    }

    // Node was not found in this branch
    return undefined;
  }

  drawBoundaries(color?: string) {
    this.viewport.ctx.fillStyle = color ?? "white";
  }

  removeById(id: number, node: QuadtreeNode = this.root): boolean {
    // If the node has children, search them
    for (let i = 0; i < node.children.length; i++) {
      if (node.children[i].id === id) {
        node.children.splice(i, 1);
        return true;
      }

      const wasRemoved = this.removeById(id, node.children[i]);
      if (wasRemoved) {
        return true;
      }
    }

    // If the node has overlapping children, search them as well
    for (let i = 0; i < node.overlappingChildren.length; i++) {
      if (node.overlappingChildren[i].id === id) {
        node.overlappingChildren.splice(i, 1);
        return true;
      }

      const wasRemoved = this.removeById(id, node.overlappingChildren[i]);
      if (wasRemoved) {
        return true;
      }
    }

    // Node was not found in this branch
    return false;
  }

  clear() {
    this.root.clear();
    this.size = 0;
  }
}

export class QuadtreeNode {
  id: number;
  position: Vector2D;
  size: Vector2D;

  nodes: QuadtreeNode[];

  children: QuadtreeNode[];
  overlappingChildren: QuadtreeNode[];
  maxChildren: number;

  depth: number;
  maxDepth: number;

  constructor(id: number, position: Vector2D, size: Vector2D, depth = 0, maxDepth = 4, maxChildren = 4) {
    this.id = id;
    this.position = position;
    this.size = size;
    this.depth = depth;
    this.maxChildren = maxChildren;
    this.maxDepth = maxDepth;
    this.nodes = [];
    this.children = [];
    this.overlappingChildren = [];
  }

  init() {}

  insert(node: QuadtreeNode | QuadtreeNode[]) {
    if (Array.isArray(node)) {
      node.forEach((n) => this.insert(n));
      return;
    }

    if (this.children.length) {
      const quadrant = this.findQuadrant(node);
      const index = quadrant.valueOf();

      if (this.isInBounds(node, this.children[index])) {
        this.children[index].insert(node);
      } else {
        this.overlappingChildren.push(node);
      }
      return;
    }

    this.nodes.push(node);

    if (this.nodes.length > this.maxChildren && this.depth < this.maxDepth) {
      this.subdivide();
    }
  }

  retrieve(node: QuadtreeNode): QuadtreeNode[] {
    // If this node is subdivided
    if (this.children.length) {
      const quadrant = this.findQuadrant(node);
      const index = quadrant.valueOf();

      return this.children[index].retrieve(node).concat(this.overlappingChildren);
    }

    return this.nodes;
  }

  subdivide() {
    const halfWidth = this.size.x / 2;
    const halfHeight = this.size.y / 2;

    // Positions of the children quadrants
    const positions = [
      new Vector2D(this.position.x, this.position.y), // NW
      new Vector2D(this.position.x + halfWidth, this.position.y), // NE
      new Vector2D(this.position.x, this.position.y + halfHeight), // SW
      new Vector2D(this.position.x + halfWidth, this.position.y + halfHeight), // SE
    ];

    const size = new Vector2D(halfWidth, halfHeight);

    this.children = positions.map(
      (pos) => new QuadtreeNode(-1, pos, size, this.depth + 1, this.maxDepth, this.maxChildren)
    );

    const nodes = [...this.nodes];
    this.nodes.length = 0;
    this.insert(nodes);
  }

  clear() {
    this.children.length = 0;
    this.overlappingChildren.length = 0;
    this.nodes.forEach((n) => n.clear());
    this.nodes.length = 0;
  }

  findQuadrant(node: QuadtreeNode): Quadrant {
    const left = node.position.x < this.position.x + this.size.x / 2;
    const top = node.position.y < this.position.y + this.size.y / 2;

    if (left) {
      return top ? Quadrant.NorthWest : Quadrant.SouthWest;
    }

    return top ? Quadrant.NorthEast : Quadrant.SouthEast;
  }

  isInBounds(a: QuadtreeNode, b: QuadtreeNode): boolean {
    return (
      a.position.x >= b.position.x &&
      a.position.x + a.size.x <= b.position.x + b.size.x &&
      a.position.y >= b.position.y &&
      a.position.y + a.size.y <= b.position.y + b.size.y
    );
  }
}
