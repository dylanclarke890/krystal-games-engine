import { DiagonalMovement } from "../constants.js";
import { Heap } from "../data-structures.js";
import { Heuristic } from "../heuristic.js";
import { backtrace } from "../utils.js";

export class AStar {
  /** @type {Heuristic} */
  heuristic;
  /** @type {DiagonalMovement} */
  diagonalMovement;
  /** @type {number} */
  weight;

  /** A* path finder.
   * @constructor
   * @param {Object} opt
   * @param {DiagonalMovement} opt.diagonalMovement Allowed diagonal movement. Defaults to "Never".
   * @param {function} opt.heuristic Heuristic function to estimate the distance.
   * (Defaults to "manhattan".
   * @param {number} opt.weight Weight to apply to the heuristic to allow for
   * suboptimal paths, in order to speed up the search.
   */
  constructor(opt = {}) {
    this.heuristic = opt.heuristic || Heuristic.manhattan;
    this.weight = opt.weight || 1;
    this.diagonalMovement = opt.diagonalMovement || DiagonalMovement.Never;
    // When diagonal movement is allowed the manhattan heuristic is not
    // admissible. It should be octile instead
    this.heuristic =
      this.diagonalMovement === DiagonalMovement.Never
        ? opt.heuristic || Heuristic.manhattan
        : opt.heuristic || Heuristic.octile;
  }

  /**
   * Find and return the the path.
   * @param {number} startX The starting x position. If using a unitSize.x greater than 1,
   * should be the x position of the leftmost cell of the unit
   * @param {number} startY The starting y position. If using a unitSize.y greater than 1,
   * should be the y position of the topmost cell of the unit
   * @param {number} endX Tne ending x position.
   * @param {number} endY Tne ending y position.
   * @param {import("../../../pathfinding/data-structures.js").Grid} grid The grid to traverse.
   * @return {number[][]} The found path, including both start and
   * end positions, or an empty array if failure.
   */
  findPath(startX, startY, endX, endY, grid) {
    const openList = new Heap((nodeA, nodeB) => nodeA.f - nodeB.f);
    const startNode = grid.getNodeAt(startX, startY),
      endNode = grid.getNodeAt(endX, endY);

    // set the `g` and `f` value of the start node to be 0
    startNode.g = 0;
    startNode.f = 0;

    // push the start node into the open list
    openList.push(startNode);
    startNode.opened = true;

    // while the open list is not empty
    while (!openList.empty()) {
      // pop the position of node which has the minimum `f` value.
      const node = openList.pop();
      node.closed = true;

      // if reached the end position, construct the path and return it
      if (node === endNode) return backtrace(endNode);

      // get neigbours of the current node
      const neighbors = grid.getNeighbors(node, this.diagonalMovement);

      for (let i = 0; i < neighbors.length; ++i) {
        const neighbor = neighbors[i];
        if (neighbor.closed) continue;

        const x = neighbor.x,
          y = neighbor.y;

        // get the distance between current node and the neighbor
        // and calculate the next g score
        const ng = node.g + (x - node.x === 0 || y - node.y === 0 ? 1 : Math.SQRT2);

        // check if the neighbor has not been inspected yet, or
        // can be reached with smaller cost from the current node
        if (!neighbor.opened || ng < neighbor.g) {
          neighbor.g = ng;
          neighbor.h =
            neighbor.h || this.weight * this.heuristic(Math.abs(x - endX), Math.abs(y - endY));
          neighbor.f = neighbor.g + neighbor.h;
          neighbor.parent = node;

          if (!neighbor.opened) {
            openList.push(neighbor);
            neighbor.opened = true;
          } else {
            // the neighbor can be reached with smaller cost.
            // Since its f value has been updated, we have to
            // update its position in the open list
            openList.updateItem(neighbor);
          }
        }
      }
    }

    return []; // failed to find the path
  }
}
