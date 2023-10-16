import { BaseSystem } from "./base-system.js";
import { BaseComponent } from "../components/base.js";
import { SystemGroup } from "../types/common-types.js";

export class InputSystem extends BaseSystem {
  name: string = "krystal__input-system";
  group: SystemGroup = "input";

  isInterestedInComponent(component: BaseComponent): boolean {
    return component.type === "input";
  }

  belongsToSystem(entity: number): boolean {
    return this.gameContext.entities.hasComponent(entity, "input");
  }

  update(_dt: number, entities: Set<number>) {
    const em = this.gameContext.entities;

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
