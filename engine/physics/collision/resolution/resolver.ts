import { GameEvents, SideOfCollision } from "../../../constants/enums.js";
import { GameContext } from "../../../core/context.js";
import { BitwiseFlags } from "../../../utils/bitwise-flags.js";
import { CollisionInfo } from "../data.js";

export class CollisionResolver {
  context: GameContext;

  constructor(context: GameContext) {
    this.context = context;
  }

  resolve(collisions: CollisionInfo[]) {
    collisions.forEach((collision) => {
      const sides = new BitwiseFlags<SideOfCollision>();
      if (!sides.isSet()) {
        return;
      }

      this.context.events.trigger(GameEvents.ENTITY_COLLIDED, collision);
    });
  }
}
