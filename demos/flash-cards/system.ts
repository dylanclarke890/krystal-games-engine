import { BaseComponent } from "../../engine/components/base.js";
import { GameContext } from "../../engine/core/context.js";
import { InputKey } from "../../engine/input/input-keys.js";
import { isPointWithinRect } from "../../engine/physics/utils.js";
import { BaseSystem } from "../../engine/systems/base-system.js";
import { SystemGroup } from "../../engine/types/common-types.js";
import { FlashCard } from "./data.js";

export class FlashCardSystem extends BaseSystem {
  name = "flash-card";
  group: SystemGroup = "custom";

  constructor(gameContext: GameContext, enabled?: boolean) {
    super(gameContext, enabled);
    this.gameContext.input.bind(InputKey.Mouse_BtnOne, "left-click");
  }

  isInterestedInComponent(component: BaseComponent): boolean {
    return component.name === "flash-card";
  }

  belongsToSystem(entity: number): boolean {
    return this.gameContext.entities.hasComponent(entity, "flash-card");
  }

  update(_dt: number, entities: Set<number>): void {
    const mouse = this.gameContext.input.getMouseCoords();
    const leftClickState = this.gameContext.input.getState("left-click");

    if (leftClickState.pressed) {
      for (const id of entities) {
        const flashCard = this.gameContext.entities.getComponent<FlashCard>(id, "flash-card");
        if (typeof flashCard === "undefined") {
          continue;
        }

        flashCard.collider.computeAABB();
        if (isPointWithinRect(mouse, flashCard.collider)) {
          flashCard.showAnswer = !flashCard.showAnswer;
        }
      }
    }

    for (const id of entities) {
      const flashCard = this.gameContext.entities.getComponent<FlashCard>(id, "flash-card");
      if (typeof flashCard === "undefined") {
        continue;
      }

      flashCard.draw(this.gameContext.viewport.ctx);
    }
  }
}
