import { BaseSystem } from "./base-system.js";
import { BaseComponent } from "../components/base.js";
import { GameContext } from "../core/context.js";
import { SystemType } from "../types/common-types.js";

export class InputSystem extends BaseSystem {
  name: SystemType = "input";
  priority: number = 0;

  constructor(context: GameContext) {
    super(context);
  }

  isInterestedInComponent(component: BaseComponent): boolean {
    if (component.type === "input") return true;
    return false;
  }

  belongsToSystem(entity: number): boolean {
    return typeof this.context.entities.getComponent(entity, "input") !== "undefined";
  }

  update(_dt: number, entities: Set<number>) {
    const em = this.context.entities;
    this.context.input.clearPressed();

    for (const id of entities) {
      const input = em.getComponent(id, "input");
      if (typeof input === "undefined") {
        continue;
      }

      for (const action of input.actions) {
        input.setState(action, this.context.input.getState(action))!;
      }
    }
  }
}
