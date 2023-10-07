import { InputBindings } from "../../types/common-types.js";
import { BaseComponent } from "../base.js";

export class Input extends BaseComponent {
  type: string = "Input";
  actions: Map<string, InputBindings>;

  constructor(bindings?: Map<string, InputBindings>) {
    super();
    this.actions = bindings ?? new Map();
  }

  bind(name: string, action: InputBindings) {
    this.actions.set(name, action);
  }

  unbind(name: string) {
    this.actions.delete(name);
  }
}
