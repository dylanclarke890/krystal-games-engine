import { InputStatus } from "../../types/common-types.js";
import { keyboardMap } from "../keyboard-map.js";
import { BaseInputHandler } from "./base-input-handler.js";

export class KeyboardInputHandler extends BaseInputHandler {
  init() {
    if (this.hasInitialised) {
      return;
    }
    this.hasInitialised = true;

    document.addEventListener("keydown", this.onKeydown.bind(this));
    document.addEventListener("keyup", this.onKeyup.bind(this));
  }

  private getKeyboardActionState(e: KeyboardEvent): Nullable<InputStatus> {
    const key = keyboardMap[e.key.toLowerCase() as keyof typeof keyboardMap];
    if (typeof key === "undefined") {
      return undefined;
    }

    return super.getStatusByInputKey(key);
  }

  onKeydown(e: KeyboardEvent): void {
    const state = this.getKeyboardActionState(e);
    if (typeof state === "undefined") {
      return;
    }

    state.held = true;
    if (!state.locked) {
      state.pressed = true;
      state.locked = true;
    }

    e.preventDefault();
  }

  onKeyup(e: KeyboardEvent): void {
    const state = this.getKeyboardActionState(e);
    if (typeof state === "undefined") {
      return;
    }

    state.released = true;

    e.preventDefault();
  }
}
