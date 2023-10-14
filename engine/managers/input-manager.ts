import { Viewport } from "../graphics/viewport.js";
import { InputKey } from "../input/input-keys.js";
import { IEventManager } from "../types/common-interfaces.js";
import { InputActionStatus, InputStatus } from "../types/common-types.js";
import { InvalidOperationError } from "../types/errors.js";
import { AccelerometerInputHandler } from "../input/handlers/accelerometer-input-handler.js";
import { MouseInputHandler } from "../input/handlers/mouse-input-handler.js";
import { KeyboardInputHandler } from "../input/handlers/keyboard-input-handler.js";
import { GameEventType } from "../constants/events.js";

export class InputManager {
  eventManager: IEventManager;
  viewport: Viewport;

  #actions: Map<string, InputStatus>;
  #bindings: Map<InputKey, string>;
  accelerometerHandler: AccelerometerInputHandler;
  keyboardHandler: KeyboardInputHandler;
  mouseHandler: MouseInputHandler;

  constructor(eventManager: IEventManager, viewport: Viewport) {
    this.eventManager = eventManager;
    this.viewport = viewport;
    this.eventManager.on(GameEventType.LOOP_AFTER_UPDATE, this.clearPressed.bind(this));

    this.#bindings = new Map();
    this.#actions = new Map();
    this.accelerometerHandler = new AccelerometerInputHandler(this.#actions, this.#bindings);
    this.mouseHandler = new MouseInputHandler(this.#actions, this.#bindings, this.viewport);
    this.keyboardHandler = new KeyboardInputHandler(this.#actions, this.#bindings);
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

  private initInputTypeEvents(key: InputKey): void {
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
        this.keyboardHandler.init();
        return;
    }
  }

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
    this.#actions.set(action, { pressed: false, held: false, released: false, locked: false });
    this.initInputTypeEvents(key);
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

  pressed(action: string): boolean {
    return !!this.#actions.get(action)?.pressed;
  }

  held(action: string): boolean {
    return !!this.#actions.get(action)?.held;
  }

  released(action: string): boolean {
    return !!this.#actions.get(action)?.released;
  }

  getState(action: string): InputActionStatus {
    const state = this.#actions.get(action);
    if (typeof state === "undefined") {
      throw new InvalidOperationError("Tried to fetch state for an action that wasn't bound", action);
    }

    return { pressed: state.pressed, held: state.held, released: state.released };
  }

  clearPressed(): void {
    for (const actionStatus of this.#actions.values()) {
      if (actionStatus.released) {
        actionStatus.held = false;
        actionStatus.locked = false;
      }
      actionStatus.released = false;
      actionStatus.pressed = false;
    }
  }
}
