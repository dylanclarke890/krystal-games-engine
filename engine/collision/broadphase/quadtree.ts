import { Quadrant } from "../../constants/enums.js";
import { Viewport } from "../../graphics/viewport.js";
import { IObjectPool, IObjectPoolManager, IQuadtree, IQuadtreeNode } from "../../types/common-interfaces.js";
import { Vector2D } from "../../utils/maths/vector-2d.js";

export class Quadtree implements IQuadtree {
  /** The node representing the entire viewport/bounds. */
  root: IQuadtreeNode;
  size: number;
  viewport: Viewport;
  nodePool: IObjectPool<IQuadtreeNode, ConstructorParameters<typeof QuadtreeNode>>;

  /**
   * @param maxDepth The maximum number of levels that the quadtree will create. Default is 4.
   * @param maxChildren The maximum number of items per quadrant before subdividing. Default is 4.
   **/
  constructor(viewport: Viewport, objectPoolManager: IObjectPoolManager, { maxDepth = 4, maxChildren = 4 } = {}) {
    this.size = 0;
    this.viewport = viewport;
    this.nodePool = objectPoolManager.create(
      "quadtreeNodes",
      QuadtreeNode,
      (node, id, pos, size, nodePool, depth, maxDepth, maxChildren) => {
        node.init(id, pos, size, nodePool, depth!, maxDepth!, maxChildren!);
      }
    );

    const pos = new Vector2D(0, 0);
    const size = new Vector2D(viewport.width, viewport.height);
    this.root = this.nodePool.acquire(-1, pos, size, this.nodePool, 0, maxDepth, maxChildren);
  }

  insert(id: number, position: Vector2D, size: Vector2D): void {
    const node = this.nodePool.acquire(id, position, size, this.nodePool);
    this.size++;
    this.root.insert(node);
  }

  retrieve(position: Vector2D, size: Vector2D): IQuadtreeNode[] {
    const node = this.nodePool.acquire(-1, position, size, this.nodePool);
    const result = this.root.retrieve(node);
    this.nodePool.release(node);
    return result;
  }

  retrieveById(id: number, node: IQuadtreeNode = this.root): Nullable<IQuadtreeNode> {
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

  removeById(id: number, node: IQuadtreeNode = this.root): boolean {
    // If the node has children, search them
    for (let i = 0; i < node.children.length; i++) {
      const child = node.children[i];
      if (child.id === id) {
        node.children.splice(i, 1);
        this.nodePool.release(child);
        return true;
      }

      const wasRemoved = this.removeById(id, node.children[i]);
      if (wasRemoved) {
        return true;
      }
    }

    // If the node has overlapping children, search them as well
    for (let i = 0; i < node.overlappingChildren.length; i++) {
      const child = node.overlappingChildren[i];
      if (child.id === id) {
        node.overlappingChildren.splice(i, 1);
        this.nodePool.release(child);
        return true;
      }

      const wasRemoved = this.removeById(id, child);
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

export class QuadtreeNode implements IQuadtreeNode {
  id!: number;
  position!: Vector2D;
  size!: Vector2D;
  nodes!: IQuadtreeNode[];
  children!: IQuadtreeNode[];
  overlappingChildren!: IQuadtreeNode[];
  maxChildren!: number;
  depth!: number;
  maxDepth!: number;
  nodePool!: IObjectPool<IQuadtreeNode, ConstructorParameters<typeof QuadtreeNode>>;

  constructor(
    id: number,
    position: Vector2D,
    size: Vector2D,
    nodePool: IObjectPool<IQuadtreeNode>,
    depth = 0,
    maxDepth = 4,
    maxChildren = 4
  ) {
    this.init(id, position, size, nodePool, depth, maxDepth, maxChildren);
  }

  init(
    id: number,
    position: Vector2D,
    size: Vector2D,
    nodePool: IObjectPool<IQuadtreeNode>,
    depth: number,
    maxDepth: number,
    maxChildren: number
  ) {
    this.id = id;
    this.position = position;
    this.size = size;
    this.nodePool = nodePool;
    this.depth = depth;
    this.maxChildren = maxChildren;
    this.maxDepth = maxDepth;
    this.nodes = [];
    this.children = [];
    this.overlappingChildren = [];
  }

  insert(node: IQuadtreeNode | IQuadtreeNode[]): void {
    if (Array.isArray(node)) {
      node.forEach((n) => this.insert(n));
      return;
    }

    if (this.children.length) {
      const quadrant = this.findQuadrant(node);
      const index = quadrant.valueOf();

      if (this.#isInBounds(node, this.children[index])) {
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

  retrieve(node: IQuadtreeNode): IQuadtreeNode[] {
    // If this node is subdivided
    if (this.children.length) {
      const quadrant = this.findQuadrant(node);
      const index = quadrant.valueOf();

      return this.children[index].retrieve(node).concat(this.overlappingChildren);
    }

    return this.nodes;
  }

  subdivide(): void {
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

    this.children = positions.map((pos) =>
      this.nodePool.acquire(-1, pos, size, this.nodePool, this.depth + 1, this.maxDepth, this.maxChildren)
    );

    const nodes = [...this.nodes];
    this.nodes.length = 0;
    this.insert(nodes);
  }

  findQuadrant(node: IQuadtreeNode): Quadrant {
    const left = node.position.x < this.position.x + this.size.x / 2;
    const top = node.position.y < this.position.y + this.size.y / 2;

    if (left) {
      return top ? Quadrant.NorthWest : Quadrant.SouthWest;
    }

    return top ? Quadrant.NorthEast : Quadrant.SouthEast;
  }

  #isInBounds(a: IQuadtreeNode, b: IQuadtreeNode): boolean {
    return (
      a.position.x >= b.position.x &&
      a.position.x + a.size.x <= b.position.x + b.size.x &&
      a.position.y >= b.position.y &&
      a.position.y + a.size.y <= b.position.y + b.size.y
    );
  }

  clear(): void {
    this.children.forEach((child) => {
      this.nodePool.release(child);
    });
    this.overlappingChildren.forEach((child) => {
      this.nodePool.release(child);
    });
    this.nodes.forEach((n) => {
      n.clear();
      this.nodePool.release(n);
    });

    this.children.length = 0;
    this.overlappingChildren.length = 0;
    this.nodes.length = 0;
  }
}
