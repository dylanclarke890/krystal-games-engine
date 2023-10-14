import { Viewport } from "../graphics/viewport.js";
import { InputKey } from "../input/input-keys.js";
import { keyboardMap } from "../input/keyboard-map.js";
import { IEventManager } from "../types/common-interfaces.js";
import { InputActionStatus, InputStatus } from "../types/common-types.js";
import { InvalidOperationError } from "../types/errors.js";
import { AccelerometerInputHandler } from "../input/handlers/accelerometer-input-handler.js";
import { MouseInputHandler } from "../input/handlers/mouse-input-handler.js";

export class InputManager {
  viewport: Viewport;
  #actions: Map<string, InputStatus>;
  #bindings: Map<InputKey, string>;
  #using;

  accelerometerHandler: AccelerometerInputHandler;
  mouseHandler: MouseInputHandler;
  eventManager: IEventManager;

  constructor(eventManager: IEventManager, viewport: Viewport) {
    this.eventManager = eventManager;
    this.viewport = viewport;
    this.#bindings = new Map();
    this.#actions = new Map();
    this.accelerometerHandler = new AccelerometerInputHandler();
    this.mouseHandler = new MouseInputHandler(this.#actions, this.#bindings, this.viewport);
    this.bind(InputKey.Mouse_BtnOne, "left-click");
    this.bind(InputKey.Arrow_Left, "left");
  }

  getMouseCoords() {
    return this.mouseHandler.mouse.clone();
  }

  getLeftClickState(): InputActionStatus {
    const state = this.getState("left-click");
    if (typeof state === "undefined") {
      throw new InvalidOperationError("Left click state was requested but not bound");
    }
    return state;
  }

  //#region Initialise

  #initializeKeyboardEvents(): void {
    if (this.#using.keyboard) return;
    this.#using.keyboard = true;

    document.addEventListener("keydown", (e) => this.#onKeyDown(e));
    document.addEventListener("keyup", (e) => this.#onKeyUp(e));
  }

  #initInputTypeEvents(key: InputKey): void {
    switch (key) {
      case InputKey.Mouse_BtnOne:
      case InputKey.Mouse_BtnTwo:
      case InputKey.Mouse_Move:
      case InputKey.Mouse_WheelDown:
      case InputKey.Mouse_WheelUp:
      case InputKey.Touch_Start:
      case InputKey.Touch_End:
        this.mouseHandler.init();
        return;
      case InputKey.Device_Motion:
        this.accelerometerHandler.init();
        return;
      default:
        this.#initializeKeyboardEvents();
        return;
    }
  }

  //#endregion Initialise

  //#region Api

  /**
   * Bind an input key to an action.
   * @param {InputKey} key
   * @param {string} action
   */
  bind(key: InputKey, action: string): void {
    if (this.#bindings.has(key)) {
      console.warn(`${key} was already bound to action ${this.#bindings.get(key)}`);
    }

    this.#bindings.set(key, action);
    this.#initInputTypeEvents(key);
  }

  /** Unbind an action from a key. */
  unbind(key: InputKey): void {
    const action = this.#bindings.get(key);
    if (typeof action === "undefined") {
      return;
    }

    const state = this.#actions.get(action);
    if (typeof state === "undefined") {
      return;
    }

    state.released = true;
    this.#bindings.delete(key);
  }

  /** Unbind all actions. */
  unbindAll(): void {
    this.#bindings.clear();
    this.#actions.clear();
  }

  /** Returns a boolean value indicating whether the input action began being pressed this frame. */
  pressed(action: string): boolean {
    return !!this.#actions.get(action)?.pressed;
  }

  /** Returns a boolean value indicating whether the input action is currently held down. */
  held(action: string): boolean {
    return !!this.#actions.get(action)?.held;
  }

  /** Returns a boolean value indicating whether the input action was released in the last frame. */
  released(action: string): boolean {
    return !!this.#actions.get(action)?.released;
  }

  /** Returns the current state of the action (pressed, held, released). */
  getState(action: string): InputActionStatus {
    const state = this.#actions.get(action);
    if (typeof state === "undefined") {
      throw new InvalidOperationError("Tried to fetch state for an action that wasn't bound", action);
    }

    return { pressed: state.pressed, held: state.held, released: state.released };
  }

  /**
   * Clears any inputs that were pressed in the previous frame and updates the state of the inputs.
   * Should be called at the start of each game frame, before any input processing is done.
   * Any inputs that were released in the previous frame will still be stored in the delayedActions map and can be
   * checked using `released()`.
   * After calling this method, `pressed()` will return false for all inputs that were pressed in the previous
   * frame.
   * Any inputs that are still held down will remain in the pressed state and can be checked using `state()`.
   */
  clearPressed(): void {}

  //#endregion Api

  //#region Events

  #targetIsInputOrText(event: any): boolean {
    const { tagName } = event.target;
    return tagName === "INPUT" || tagName === "TEXTAREA";
  }

  /** @param orPropagate Defaults to true */
  #preventDefault(e: Event, orPropagate?: boolean): void {
    e.preventDefault();
    if (orPropagate ?? true === true) {
      e.stopPropagation();
    }
  }

  #getKeyboardAction(e: KeyboardEvent): Nullable<string> {
    if (this.#targetIsInputOrText(e)) {
      return undefined;
    }

    const key = keyboardMap[e.key.toLowerCase() as keyof typeof keyboardMap];
    if (typeof key === "undefined") {
      return undefined;
    }

    return this.#bindings.get(key);
  }

  #onKeyDown(e: KeyboardEvent): void {
    const action = this.#getKeyboardAction(e);
    if (typeof action === "undefined") {
      return;
    }

    const state = this.#actions.get(action);
    if (typeof state === "undefined") {
      return;
    }

    if (!state.locked) {
      state.pressed = true;
      state.locked = true;
    }

    this.#preventDefault(e, false);
  }

  #onKeyUp(e: KeyboardEvent): void {
    const action = this.#getKeyboardAction(e);
    if (typeof action === "undefined") {
      return;
    }

    const state = this.#actions.get(action);
    if (typeof state === "undefined") {
      return;
    }

    state.released = true;
    this.#preventDefault(e, false);
  }

  //#endregion Events
}
