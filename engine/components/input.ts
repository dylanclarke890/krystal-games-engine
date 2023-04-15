import { InputBindings } from "../utils/types.js";

export class Input {
  actions: Map<string, InputBindings>;

  constructor(bindings: Map<string, InputBindings>) {
    this.actions = bindings;
  }

  bind(name: string, action: InputBindings) {
    this.actions.set(name, action);
  }
}
