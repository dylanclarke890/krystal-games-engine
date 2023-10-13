import { GameEventType } from "../../../constants/events.js";
import { GameContext } from "../../../core/context.js";
import { CollisionInfo } from "../data.js";

export class CollisionResolver {
  context: GameContext;

  constructor(context: GameContext) {
    this.context = context;
  }

  resolve(collisions: CollisionInfo[]) {
    collisions.forEach((collision) => {
      this.context.events.trigger(GameEventType.ENTITY_COLLIDED, collision);
    });
  }
}
