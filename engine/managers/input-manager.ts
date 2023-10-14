import { InputKeys } from "../constants/enums.js";
import { Viewport } from "../graphics/viewport.js";
import { Vector2 } from "../maths/vector2.js";
import { Vector3 } from "../maths/vector3.js";
import { UserAgent } from "../utils/user-agent.js";
import { keyboardMap } from "../constants/keyboard-map.js";
import { IEventManager } from "../types/common-interfaces.js";
import { InputActionStatus, InputStatus } from "../types/common-types.js";
import { InvalidOperationError } from "../types/errors.js";

export class InputManager {
  viewport: Viewport;
  actions: Map<string, InputStatus>;
  #bindings: Map<InputKeys, string>;
  #using;

  mouse: Vector2;
  accel: Vector3;
  eventManager: IEventManager;

  constructor(eventManager: IEventManager, viewport: Viewport) {
    this.eventManager = eventManager;
    this.viewport = viewport;
    this.#bindings = new Map();
    this.actions = new Map();
    this.mouse = new Vector2();
    this.accel = new Vector3();
    this.#using = {
      mouse: false,
      touch: false,
      keyboard: false,
      accelerometer: false,
    };

    this.bind(InputKeys.Mouse_BtnOne, "left-click");
    this.bind(InputKeys.Arrow_Left, "left");
  }

  getLeftClickState(): InputActionStatus {
    const state = this.getState("left-click");
    if (typeof state === "undefined") {
      throw new InvalidOperationError("Left click state was requested but not bound");
    }
    return state;
  }

  //#region Initialise

  #initializeMouseEvents(): void {
    if (this.#using.mouse) return;
    this.#using.mouse = true;

    const canvas = this.viewport.canvas;
    canvas.addEventListener("wheel", (e) => this.#onMouseWheel(e), { passive: false }); // Stops Chrome warning
    canvas.addEventListener("contextmenu", (e) => this.#onContextMenu(e), false);
    canvas.addEventListener("mousedown", (e) => this.#onMouseDown(e), false);
    canvas.addEventListener("mouseup", (e) => this.#onMouseUp(e), false);
    canvas.addEventListener("mousemove", (e) => this.#onMouseMove(e), false);
    if (UserAgent.instance.device.touchDevice) this.#initializeTouchEvents();
  }

  #initializeTouchEvents(): void {
    if (this.#using.touch) return;
    this.#using.touch = true;

    const canvas = this.viewport.canvas;
    // Standard
    canvas.addEventListener("touchstart", (e) => this.#onTouchStart(e), false);
    canvas.addEventListener("touchend", (e) => this.#onTouchEnd(e), false);
    canvas.addEventListener("touchcancel", (e) => this.#onTouchEnd(e), false);
    canvas.addEventListener("touchmove", (e) => this.#onMouseMove(e), false);

    // MS
    canvas.addEventListener("MSPointerDown", (e) => this.#onTouchStart(e as TouchEvent), false);
    canvas.addEventListener("MSPointerUp", (e) => this.#onTouchEnd(e as TouchEvent), false);
    canvas.addEventListener("MSPointerMove", (e) => this.#onMouseMove(e as TouchEvent), false);
    canvas.style.touchAction = "none";
  }

  #initializeKeyboardEvents(): void {
    if (this.#using.keyboard) return;
    this.#using.keyboard = true;

    document.addEventListener("keydown", (e) => this.#onKeyDown(e));
    document.addEventListener("keyup", (e) => this.#onKeyUp(e));
  }

  #initializeAccelerometer(): void {
    if (this.#using.accelerometer) return;
    this.#using.accelerometer = true;
    window.addEventListener("devicemotion", (e) => this.onDeviceMotion(e), false);
  }

  #initInputTypeEvents(key: InputKeys): void {
    switch (key) {
      case InputKeys.Mouse_BtnOne:
      case InputKeys.Mouse_BtnTwo:
      case InputKeys.Mouse_Move:
      case InputKeys.Mouse_WheelDown:
      case InputKeys.Mouse_WheelUp:
        this.#initializeMouseEvents();
        return;
      case InputKeys.Touch_Start:
      case InputKeys.Touch_End:
        this.#initializeTouchEvents();
        return;
      case InputKeys.Device_Motion:
        this.#initializeAccelerometer();
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
   * @param {InputKeys} key
   * @param {string} action
   */
  bind(key: InputKeys, action: string): void {
    if (this.#bindings.has(key)) {
      console.warn(`${key} was already bound to action ${this.#bindings.get(key)}`);
    }

    this.#bindings.set(key, action);
    this.#initInputTypeEvents(key);
  }

  /** Unbind an action from a key. */
  unbind(key: InputKeys): void {
    const action = this.#bindings.get(key);
    if (typeof action === "undefined") {
      return;
    }

    const state = this.actions.get(action);
    if (typeof state === "undefined") {
      return;
    }

    state.released = true;
    this.#bindings.delete(key);
  }

  /** Unbind all actions. */
  unbindAll(): void {
    this.#bindings.clear();
    this.actions.clear();
  }

  /** Returns a boolean value indicating whether the input action began being pressed this frame. */
  pressed(action: string): boolean {
    return !!this.actions.get(action)?.pressed;
  }

  /** Returns a boolean value indicating whether the input action is currently held down. */
  held(action: string): boolean {
    return !!this.actions.get(action)?.held;
  }

  /** Returns a boolean value indicating whether the input action was released in the last frame. */
  released(action: string): boolean {
    return !!this.actions.get(action)?.released;
  }

  /** Returns the current state of the action (pressed, held, released). */
  getState(action: string): InputActionStatus {
    const state = this.actions.get(action);
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

    const state = this.actions.get(action);
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

    const state = this.actions.get(action);
    if (typeof state === "undefined") {
      return;
    }

    state.released = true;
    this.#preventDefault(e, false);
  }

  #onMouseWheel(e: WheelEvent): void {
    const scrollAmount = Math.sign(e.deltaY);
    const key = scrollAmount > 0 ? InputKeys.Mouse_WheelDown : InputKeys.Mouse_WheelUp;

    const action = this.#bindings.get(key);
    if (typeof action === "undefined") {
      return;
    }

    const state = this.actions.get(action);
    if (typeof state === "undefined") {
      return;
    }

    state.pressed = true;
    state.released = true;

    this.#preventDefault(e);
  }

  #onMouseMove(e: TouchEvent | MouseEvent): void {
    const viewport = this.viewport;
    const internalWidth = viewport.canvas.offsetWidth || viewport.realWidth;
    const scale = viewport.scale * (internalWidth / viewport.realWidth);

    const pos = viewport.canvas.getBoundingClientRect();
    const { clientX, clientY } = "touches" in e ? e.touches[0] : e;
    this.mouse.x = (clientX - pos.left) / scale;
    this.mouse.y = (clientY - pos.top) / scale;
  }

  #getMouseAction(e: MouseEvent): Nullable<string> {
    if (this.#targetIsInputOrText(e)) {
      return undefined;
    }

    let key;
    switch (e.button) {
      case 0:
      case 1:
        key = InputKeys.Mouse_BtnOne;
        break;
      case 2:
        key = InputKeys.Mouse_BtnTwo;
        break;
      default:
        break;
    }

    if (typeof key === "undefined") {
      return undefined;
    }

    return this.#bindings.get(key);
  }

  #onMouseDown(e: MouseEvent): void {
    this.#onMouseMove(e);

    const action = this.#getMouseAction(e);
    if (typeof action === "undefined") {
      return;
    }

    const state = this.actions.get(action);
    if (typeof state === "undefined") {
      return;
    }

    state.pressed = true;
    this.#preventDefault(e);
  }

  #onMouseUp(e: MouseEvent): void {
    const action = this.#getMouseAction(e);
    if (typeof action === "undefined") {
      return;
    }

    const state = this.actions.get(action);
    if (typeof state === "undefined") {
      return;
    }

    state.released = true;
    this.#preventDefault(e);
  }

  #onTouchStart(e: TouchEvent): void {
    if (this.#targetIsInputOrText(e)) {
      return;
    }

    // Focus window element for mouse clicks. Prevents issues when running the game in an iframe.
    if (UserAgent.instance.device.mobile) {
      window.focus();
    }
    this.#onMouseMove(e);

    const action = this.#bindings.get(InputKeys.Touch_Start);
    if (typeof action === "undefined") {
      return;
    }

    const state = this.actions.get(action);
    if (typeof state === "undefined") {
      return;
    }

    state.pressed = true;
    this.#preventDefault(e);
  }

  #onTouchEnd(e: TouchEvent): void {
    if (this.#targetIsInputOrText(e)) {
      return;
    }

    const action = this.#bindings.get(InputKeys.Touch_End);
    if (typeof action === "undefined") {
      return;
    }

    const state = this.actions.get(action);
    if (typeof state === "undefined") {
      return;
    }

    state.released = true;
    this.#preventDefault(e);
  }

  #onContextMenu(e: MouseEvent): void {
    if (this.#bindings.has(InputKeys.Context_Menu)) {
      this.#preventDefault(e);
    }
  }

  onDeviceMotion(e: DeviceMotionEvent): void {
    if (e.accelerationIncludingGravity !== null) {
      this.accel.x = e.accelerationIncludingGravity.x ?? 0;
      this.accel.y = e.accelerationIncludingGravity.y ?? 0;
      this.accel.z = e.accelerationIncludingGravity.z ?? 0;
    }
  }

  //#endregion Events
}
