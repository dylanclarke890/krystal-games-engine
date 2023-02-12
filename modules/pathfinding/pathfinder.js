import { Algorithm, DiagonalMovement, HeuristicType } from "./constants.js";
import { AStar } from "./algorithms/a-star.js";
import { Heuristic } from "./heuristic.js";
import { Grid } from "./data-structures.js";

export class PathFinder {
  constructor({ algorithm, heuristic, bi, allowDiagonal, crossCorners, weight }) {
    let h;
    switch (heuristic) {
      default:
      case HeuristicType.Manhattan:
        h = Heuristic.manhattan;
        break;
      case HeuristicType.Euclidean:
        h = Heuristic.euclidean;
        break;
      case HeuristicType.Octile:
        h = Heuristic.octile;
        break;
      case HeuristicType.Chebyshev:
        h = Heuristic.chebyshev;
        break;
    }

    const { Never, IfAtMostOneObstacle, OnlyWhenNoObstacles } = DiagonalMovement;
    const diagonalMovement = allowDiagonal
      ? crossCorners
        ? IfAtMostOneObstacle
        : OnlyWhenNoObstacles
      : Never;

    weight = weight || 1;

    const opt = {
      heuristic: h,
      diagonalMovement,
      weight,
    };

    switch (algorithm) {
      default:
      case Algorithm.AStar:
        this.finder = new AStar(opt);
        if (bi) this.finder = new AStar(opt);
        // if (bi) this.finder = new BiAStar(opt);
        break;
      // case Algorithm.BestFirst:
      //   this.finder = bi ? new BiBestFirst(opt) : new BestFirst(opt);
      //   break;
      // case Algorithm.BreadthFirst:
      //   this.finder = bi ? new BiBreadthFirst(opt) : new BreadthFirst(opt);
      //   break;
      // case Algorithm.Dijkstra:
      //   this.finder = bi ? new BiDijkstra(opt) : new Dijkstra(opt);
      //   break;
      // case Algorithm.IDAStar:
      //   this.finder = new IDAStar(opt);
      //   break;
      // case Algorithm.JumpPoint:
      //   this.finder = new JumpPoint(opt);
      //   break;
    }
  }

  findPath(x0, y0, x1, y1, grid) {
    if (!(grid instanceof Grid)) grid = new Grid({ matrix: grid });

    return this.finder.findPath(x0, y0, x1, y1, grid);
  }
}
