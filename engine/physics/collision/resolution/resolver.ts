import { ShapeType } from "../../../constants/enums.js";
import { GameEventType } from "../../../constants/events.js";
import { GameContext } from "../../../core/context.js";
import { CollisionInfo } from "../data.js";
import { ResolutionStrategies } from "./resolution-strategies.js";

export class CollisionResolver {
  context: GameContext;
  resolutionStrategies: Map<string, (info: CollisionInfo) => void>;
  totalResolved: number;

  constructor(context: GameContext) {
    this.context = context;
    this.resolutionStrategies = new Map();
    this.totalResolved = 0;

    this.resolutionStrategies.set(ShapeType.Circle + ShapeType.Circle, ResolutionStrategies.resolveCircles);

    // this.strategies.set(ShapeType.Rectangle + ShapeType.Rectangle, Strategies.checkRectsCollision);
    // this.strategies.set(ShapeType.Circle + ShapeType.Rectangle, Strategies.checkCircleRectCollision);
    // this.strategies.set(ShapeType.Rectangle + ShapeType.Circle, Strategies.checkCircleRectCollision);
  }

  resolve(collisions: CollisionInfo[]) {
    this.totalResolved = 0;

    for (const collision of collisions) {
      const strategy = this.resolutionStrategies.get(
        collision.entityA.collider.shapeType + collision.entityB.collider.shapeType
      );

      if (typeof strategy === "function") {
        strategy(collision);
      }

      this.totalResolved++;
      this.context.events.trigger(GameEventType.ENTITY_COLLIDED, collision);
    }
  }
}
