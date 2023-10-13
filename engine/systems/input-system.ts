import { BaseSystem } from "./base-system.js";
import { BaseComponent } from "../components/base.js";
import { SystemType } from "../types/common-types.js";

export class InputSystem extends BaseSystem {
  name: SystemType = "input";
  priority: number = 0;

  isInterestedInComponent(component: BaseComponent): boolean {
    if (component.type === "input") return true;
    return false;
  }

  belongsToSystem(entity: number): boolean {
    return typeof this.gameContext.entities.getComponent(entity, "input") !== "undefined";
  }

  update(_dt: number, entities: Set<number>) {
    const em = this.gameContext.entities;
    this.gameContext.input.clearPressed();

    for (const id of entities) {
      const input = em.getComponent(id, "input");
      if (typeof input === "undefined") {
        continue;
      }

      for (const action of input.actions) {
        input.setState(action, this.gameContext.input.getState(action))!;
      }
    }
  }
}
