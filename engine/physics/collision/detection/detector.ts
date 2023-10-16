import { ShapeType } from "../../../constants/enums.js";
import { GameContext } from "../../../core/context.js";
import { PairedSet } from "../../../utils/paired-set.js";
import { ColliderEntity, CollisionInfo } from "../data.js";
import * as Strategies from "./detection-strategies.js";

export class CollisionDetector {
  context: GameContext;
  totalPotential: number;
  totalFound: number;
  strategies: Map<string, (a: ColliderEntity, b: ColliderEntity) => Nullable<CollisionInfo>>;

  constructor(context: GameContext) {
    this.context = context;
    this.totalPotential = 0;
    this.totalFound = 0;
    this.strategies = new Map();
    this.strategies.set(ShapeType.Circle + ShapeType.Circle, Strategies.checkCirclesCollision);
    this.strategies.set(ShapeType.Rectangle + ShapeType.Rectangle, Strategies.checkRectsCollision);
    this.strategies.set(ShapeType.Circle + ShapeType.Rectangle, Strategies.checkCircleRectCollision);
    this.strategies.set(ShapeType.Rectangle + ShapeType.Circle, Strategies.checkCircleRectCollision);
  }

  detect(possibleCollisions: Pair<ColliderEntity>[]): CollisionInfo[] {
    this.totalPotential = 0;
    this.totalFound = 0;

    const collisions = [];
    const checked = new PairedSet<number>();
    for (const [a, b] of possibleCollisions) {
      if (checked.has(a.id, b.id)) {
        continue;
      }
      this.totalPotential++;

      checked.add(a.id, b.id);
      const strategy = this.strategies.get(a.collider.shapeType + b.collider.shapeType);
      if (typeof strategy === "undefined") {
        continue;
      }

      const info = strategy(a, b);
      if (typeof info !== "undefined") {
        collisions.push(info);
        this.totalFound++;
      }
    }

    return collisions;
  }
}
