import * as Strategies from "./resolution-strategies.js";
import { ShapeType } from "../../../constants/enums.js";
import { GameEventType } from "../../../constants/events.js";
import { GameContext } from "../../../core/context.js";
import { CollisionInfo } from "../data.js";

export class CollisionResolver {
  context: GameContext;
  totalResolved: number;
  strategies: Map<string, (info: CollisionInfo) => void>;

  constructor(context: GameContext) {
    this.context = context;
    this.totalResolved = 0;
    this.strategies = new Map();
    this.strategies.set(ShapeType.Circle + ShapeType.Circle, Strategies.resolveCircleCircleCollision);
    // this.strategies.set(ShapeType.Rectangle + ShapeType.Rectangle, Strategies.checkRectsCollision);
    // this.strategies.set(ShapeType.Circle + ShapeType.Rectangle, Strategies.checkCircleRectCollision);
    // this.strategies.set(ShapeType.Rectangle + ShapeType.Circle, Strategies.checkCircleRectCollision);
  }

  resolve(collisions: CollisionInfo[]) {
    this.totalResolved = 0;
    for (const collision of collisions) {
      const resolveStrategy = this.strategies.get(
        collision.entityA.collider.shapeType + collision.entityB.collider.shapeType
      );
      if (typeof resolveStrategy !== "function") {
        continue;
      }

      resolveStrategy(collision);

      this.totalResolved++;
      this.context.events.trigger(GameEventType.ENTITY_COLLIDED, collision);
    }
  }
}
