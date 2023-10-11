import { BaseSystem } from "./base-system.js";
import { BaseComponent } from "../components/base.js";
import { Input } from "../components/input.js";
import { GameContext } from "../core/context.js";

export class InputSystem extends BaseSystem {
  name: string = "InputSystem";
  priority: number = 0;

  constructor(context: GameContext) {
    super(context);
  }

  isInterestedInComponent(component: BaseComponent): boolean {
    if (component.type === "input") return true;
    return false;
  }

  belongsToSystem(entity: number): boolean {
    return typeof this.context.entities.getComponent<Input>(entity, "input") !== "undefined";
  }

  update(dt: number, entities: Set<number>) {
    const em = this.context.entities;
    this.context.input.clearPressed();

    for (const id of entities) {
      const input = em.getComponent<Input>(id, "input");
      if (typeof input === "undefined") {
        continue;
      }

      for (const [action, { pressed, held, released }] of input.actions) {
        const state = this.context.input.state(action);
        if (state.pressed && typeof pressed === "function") pressed(id, em, dt);
        if (state.held && typeof held === "function") held(id, em, dt);
        if (state.released && typeof released === "function") released(id, em, dt);
      }
    }
  }
}
