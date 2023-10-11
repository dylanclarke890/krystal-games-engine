import { ComponentType, InputActionStatus } from "../types/common-types.js";
import { InvalidOperationError } from "../types/errors.js";
import { BaseComponent } from "./base.js";

export class Input extends BaseComponent {
  type: ComponentType = "input";
  actions: Set<string>;
  state: Map<string, InputActionStatus>;

  constructor(...actions: string[]) {
    super();
    this.state = new Map();
    this.actions = new Set(actions);
    actions.forEach((action) => {
      this.state.set(action, { held: false, pressed: false, released: false });
    });
  }

  setState(action: string, newState: InputActionStatus): void {
    const state = this.state.get(action);
    if (!state) {
      throw new InvalidOperationError("Tried setting the state for an action that wasn't bound", this);
    }

    state.pressed = newState.pressed;
    state.held = newState.held;
    state.released = newState.released;
  }

  addAction(action: string): void {
    this.actions.add(action);
    this.state.set(action, { held: false, pressed: false, released: false });
  }

  removeAction(action: string): void {
    this.actions.delete(action);
    this.state.delete(action);
  }
}
