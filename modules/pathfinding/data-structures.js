import { DiagonalMovement } from "./constants.js";

/**
 * A node in a grid.
 * This class holds some basic information about a node and custom
 * attributes may be added, depending on the algorithms' needs.
 * @constructor
 * @param {number}
 * @param {number}
 * @param {boolean} [walkable]
 */
export class Node {
  /**
   * The x coordinate of the node on the grid.
   * @type number
   */
  x;
  /**
   * The y coordinate of the node on the grid.
   * @type number
   */
  y;
  /**
   * Whether this node can be walked through.
   * @type boolean
   */
  walkable;

  constructor(x, y, walkable) {
    this.x = x;
    this.y = y;
    this.walkable = walkable === undefined ? true : walkable;
  }
}

/**
 * The Grid class, which serves as the encapsulation of the layout of the nodes.
 * @constructor
 * @param {number|Array<Array<(number|boolean)>>} width Number of columns of the grid
 * @param {number} height Number of rows of the grid.
 * @param {Array<Array<(number|boolean)>>} [matrix] - A 0-1 matrix
 * representing the walkable status of the nodes(0 or false for walkable).
 * If the matrix is not supplied, all the nodes will be walkable.  */
export class Grid {
  /**
   * The number of columns of the grid.
   * @type number
   */
  width;
  /**
   * The number of rows of the grid.
   * @type number
   */
  height;
  /**
   * A 2D array of nodes.
   */
  nodes;

  constructor({ width, height, matrix }) {
    if (matrix != null) {
      height = matrix.length;
      width = matrix[0].length;
    }

    this.width = width;
    this.height = height;
    this.nodes = this.#constructNodes(width, height, matrix);
  }

  /**
   * Build and return the nodes.
   * @private
   * @param {number} w
   * @param {number} h
   * @param {Array<Array<number|boolean>>} [matrix] - A 0-1 matrix representing
   * the walkable status of the nodes.
   * @see Grid
   */
  #constructNodes(w, h, matrix) {
    const nodes = new Array(h);
    for (let i = 0; i < h; i++) {
      nodes[i] = new Array(w);
      for (let j = 0; j < w; j++) nodes[i][j] = new Node(j, i);
    }

    if (matrix === undefined) return nodes;
    if (matrix.length !== h || matrix[0].length !== w) throw new Error("Matrix size does not fit");

    // falsy vals mean walkable
    for (let i = 0; i < h; i++)
      for (let j = 0; j < w; j++) {
        nodes[i][j].walkable = !matrix[i][j];
      }

    return nodes;
  }

  getNodeAt(x, y) {
    return this.nodes[y][x];
  }

  /**
   * Determine whether the node at the given position is walkable.
   * (Also returns false if the position is outside the grid.)
   * @param {number} x - The x coordinate of the node.
   * @param {number} y - The y coordinate of the node.
   * @return {boolean} - The walkability of the node.
   */
  isWalkableAt(x, y) {
    return this.containsPosition(x, y) && this.nodes[y][x].walkable;
  }

  /**
   * Determine whether the position is inside the grid.
   * @param {number} x - The x coordinate of the node.
   * @param {number} y - The y coordinate of the node.
   * @return {boolean} - .
   */
  containsPosition(x, y) {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  /**
   * Set whether the node on the given position is walkable.
   * NOTE: throws exception if the coordinate is not inside the grid.
   * @param {number} x - The x coordinate of the node.
   * @param {number} y - The y coordinate of the node.
   * @param {boolean} walkable - Whether the position is walkable.
   */
  setWalkableAt(x, y, walkable) {
    this.nodes[y][x].walkable = walkable;
  }

  /**
   * Get the neighbors of the given node.
   *
   *     offsets      diagonalOffsets:
   *  +---+---+---+    +---+---+---+
   *  |   | 0 |   |    | 0 |   | 1 |
   *  +---+---+---+    +---+---+---+
   *  | 3 |   | 1 |    |   |   |   |
   *  +---+---+---+    +---+---+---+
   *  |   | 2 |   |    | 3 |   | 2 |
   *  +---+---+---+    +---+---+---+
   *
   *  When allowDiagonal is true, if offsets[i] is valid, then
   *  diagonalOffsets[i] and
   *  diagonalOffsets[(i + 1) % 4] is valid.
   * @param {Node} node
   * @param {DiagonalMovement} diagonalMovement
   */
  getNeighbors(node, diagonalMovement) {
    const nodes = this.nodes;
    const neighbors = [];
    const { x, y } = node;

    let s0 = false,
      s1 = false,
      s2 = false,
      s3 = false;
    // ↑
    if (this.isWalkableAt(x, y - 1)) {
      neighbors.push(nodes[y - 1][x]);
      s0 = true;
    }
    // →
    if (this.isWalkableAt(x + 1, y)) {
      neighbors.push(nodes[y][x + 1]);
      s1 = true;
    }
    // ↓
    if (this.isWalkableAt(x, y + 1)) {
      neighbors.push(nodes[y + 1][x]);
      s2 = true;
    }
    // ←
    if (this.isWalkableAt(x - 1, y)) {
      neighbors.push(nodes[y][x - 1]);
      s3 = true;
    }

    let d0 = false,
      d1 = false,
      d2 = false,
      d3 = false;

    switch (diagonalMovement) {
      case DiagonalMovement.Never:
        return neighbors;
      case DiagonalMovement.Always:
        d0 = true;
        d1 = true;
        d2 = true;
        d3 = true;
        break;
      case DiagonalMovement.OnlyWhenNoObstacles:
        d0 = s3 && s0;
        d1 = s0 && s1;
        d2 = s1 && s2;
        d3 = s2 && s3;
        break;
      case DiagonalMovement.IfAtMostOneObstacle:
        d0 = s3 || s0;
        d1 = s0 || s1;
        d2 = s1 || s2;
        d3 = s2 || s3;
        break;
      default:
        throw new Error(`Invalid diagonalMovement type: ${diagonalMovement}`);
    }

    // ↖
    if (d0 && this.isWalkableAt(x - 1, y - 1)) neighbors.push(nodes[y - 1][x - 1]);
    // ↗
    if (d1 && this.isWalkableAt(x + 1, y - 1)) neighbors.push(nodes[y - 1][x + 1]);
    // ↘
    if (d2 && this.isWalkableAt(x + 1, y + 1)) neighbors.push(nodes[y + 1][x + 1]);
    // ↙
    if (d3 && this.isWalkableAt(x - 1, y + 1)) neighbors.push(nodes[y + 1][x - 1]);

    return neighbors;
  }
  /**
   * Get a clone of this grid.
   * @return {Grid} Cloned grid.
   */
  clone() {
    const { width, height, nodes } = this;
    const newGrid = new Grid({ width, height }),
      newNodes = new Array(height);

    for (let i = 0; i < height; i++) {
      newNodes[i] = new Array(width);
      for (let j = 0; j < width; j++) newNodes[i][j] = new Node(j, i, nodes[i][j].walkable);
    }
    newGrid.nodes = newNodes;

    return newGrid;
  }
}

export class Queue {
  get size() {
    return this.arr.length;
  }

  constructor(/** @type {any[]} */ arr) {
    this.arr = arr || [];
  }

  head() {
    return this.arr[0];
  }

  enqueue(val) {
    this.arr.push(val);
  }

  dequeue() {
    return this.arr.shift();
  }

  tail() {
    return this.arr[this.arr.length - 1];
  }

  contains(v) {
    return this.arr.includes(v);
  }
}

export class MinHeap {
  constructor(selector) {
    this.items = [];
    this.selector = selector;
  }

  seek() {
    return this.items[0];
  }

  push(item) {
    let i = this.items.length;
    this.items.push(item);
    while (
      i > 0 &&
      this.selector(this.items[Math.floor((i + 1) / 2 - 1)]) > this.selector(this.items[i])
    ) {
      let t = this.items[i];
      this.items[i] = this.items[Math.floor((i + 1) / 2 - 1)];
      this.items[Math.floor((i + 1) / 2 - 1)] = t;
      i = Math.floor((i + 1) / 2 - 1);
    }
  }

  pop() {
    if (this.items.length <= 1) return this.items.pop();
    const ret = this.items[0];
    this.items[0] = this.items.pop();
    let i = 0;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      let lowest =
        this.selector(this.items[(i + 1) * 2]) < this.selector(this.items[(i + 1) * 2 - 1])
          ? (i + 1) * 2
          : (i + 1) * 2 - 1;
      if (this.selector(this.items[i]) > this.selector(this.items[lowest])) {
        let t = this.items[i];
        this.items[i] = this.items[lowest];
        this.items[lowest] = t;
        i = lowest;
      } else break;
    }
    return ret;
  }

  delete(item) {
    let i = this.items.indexOf(item);
    // heapify
    this.items[i] = this.items.pop();
    // eslint-disable-next-line no-constant-condition
    while (true) {
      let lowest =
        this.selector(this.items[(i + 1) * 2]) < this.selector(this.items[(i + 1) * 2 - 1])
          ? (i + 1) * 2
          : (i + 1) * 2 - 1;
      if (this.selector(this.items[i]) > this.selector(this.items[lowest])) {
        let t = this.items[i];
        this.items[i] = this.items[lowest];
        this.items[lowest] = t;
        i = lowest;
      } else break;
    }
  }

  heapify(arr) {
    for (let i = 0; i < arr.length; i++) this.push(arr[i]);
  }
}

const posy = (i) => Math.floor(Math.log2(i + 1)) * 50 + 20;

const posx = (i) => {
  const level = Math.floor(Math.log2(i + 1));
  const len = Math.pow(2, level);
  const j = i - len + 2;
  const k = j / (len + 1) - 0.5;
  const x = k * 600 + 300;
  return x;
};

export const visualize = (ctx, arr) => {
  ctx.strokeStyle = "#FF0000";
  ctx.font = "14px Arial";
  ctx.clearRect(0, 0, 600, 600);
  for (let i = 0; i < arr.length; i++) {
    ctx.beginPath();
    ctx.moveTo(posx(i), posy(i));
    const j = Math.floor((i + 1) / 2 - 1);
    ctx.lineTo(posx(j), posy(j));
    ctx.stroke();
  }
  for (let i = 0; i < arr.length; i++) {
    ctx.beginPath();
    ctx.arc(posx(i), posy(i), 12, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fillStyle = "#99ff99";
    ctx.fill();
    ctx.fillStyle = "#000000";
    console.log(posx(i), posy(i));
    ctx.fillText(arr[i], posx(i) - 4, posy(i) + 4);
  }
};
