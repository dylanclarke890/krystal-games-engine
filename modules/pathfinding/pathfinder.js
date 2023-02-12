import { Heuristic } from "./enums.js";
import { Algorithm, DiagonalMovement, HeuristicType } from "./constants.js";

export class PathFinder {
  constructor({ algorithmType, heuristicType, bi, allowDiagonal, crossCorners, weight }) {
    let heuristic;
    switch (heuristicType) {
      default:
      case HeuristicType.Manhattan:
        heuristic = Heuristic.manhattan;
        break;
      case HeuristicType.Euclidean:
        heuristic = Heuristic.euclidean;
        break;
      case HeuristicType.Octile:
        heuristic = Heuristic.octile;
        break;
      case HeuristicType.Chebyshev:
        heuristic = Heuristic.chebyshev;
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
      heuristic,
      diagonalMovement,
      weight,
    };

    switch (algorithmType) {
      default:
      case Algorithm.AStar:
        this.finder = bi ? new BiAStar(opt) : new AStar(opt);
        break;
      case Algorithm.BestFirst:
        this.finder = bi ? new BiBestFirst(opt) : new BestFirst(opt);
        break;
      case Algorithm.BreadthFirst:
        this.finder = bi ? new BiBreadthFirst(opt) : new BreadthFirst(opt);
        break;
      case Algorithm.Dijkstra:
        this.finder = bi ? new BiDijkstra(opt) : new Dijkstra(opt);
        break;
      case Algorithm.IDAStar:
        this.finder = new IDAStar(opt);
        break;
      case Algorithm.JumpPoint:
        this.finder = new JumpPoint(opt);
        break;
    }
  }

  findPath(x0, y0, x1, y1, grid) {
    return this.finder.findPath(x0, y0, x1, y1, grid);
  }
}
