import { ShapeType } from "../../../constants/enums.js";
import { GameContext } from "../../../core/context.js";
import { ColliderEntity, CollisionInfo } from "../data.js";
import * as Strategies from "./detection-strategies.js";

export class CollisionDetector {
  context: GameContext;
  collisionsChecked: number;
  collisionsFound: number;
  strategies: Map<string, (a: ColliderEntity, b: ColliderEntity) => CollisionInfo | undefined>;

  constructor(context: GameContext) {
    this.context = context;
    this.collisionsChecked = 0;
    this.collisionsFound = 0;
    this.strategies = new Map();
    this.strategies.set(ShapeType.Circle + ShapeType.Circle, Strategies.checkCirclesCollision);
    this.strategies.set(ShapeType.Rectangle + ShapeType.Rectangle, Strategies.checkRectsCollision);
    this.strategies.set(ShapeType.Circle + ShapeType.Rectangle, Strategies.checkCircleRectCollision);
    this.strategies.set(ShapeType.Rectangle + ShapeType.Circle, Strategies.checkCircleRectCollision);
  }

  detect(possibleCollisions: Pair<ColliderEntity>[]): CollisionInfo[] {
    this.collisionsChecked = 0;
    this.collisionsFound = 0;

    const collisions = [];
    for (const [a, b] of possibleCollisions) {
      const strategy = this.strategies.get(a.collider.shapeType + b.collider.shapeType);
      if (typeof strategy === "undefined") {
        continue;
      }

      const info = strategy(a, b);
      if (typeof info !== "undefined") {
        collisions.push(info);
        this.collisionsFound++;
      }
      this.collisionsChecked++;
    }

    return collisions;
  }
}
