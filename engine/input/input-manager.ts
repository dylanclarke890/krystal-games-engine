import { InputKeys } from "../constants/enums.js";
import { EventSystem } from "../events/event-system.js";
import { Viewport } from "../graphics/viewport.js";
import { Assert } from "../utils/assert.js";
import { Vector2D } from "../utils/maths/vector-2d.js";
import { Vector3D } from "../utils/maths/vector-3d.js";
import { InputBindingType } from "../utils/types.js";
import { UserAgent } from "../utils/user-agent.js";
import { keyboardMap } from "./keyboard-map.js";

export class InputManager {
  viewport: Viewport;

  #bindings: Map<InputKeys, string>;
  #pressed: Map<string, boolean>;
  #actions: Map<string, boolean>;
  #locks: Map<string, boolean>;
  #delayedActions: Map<string, boolean>;
  #using;

  mouse: Vector2D;
  accel: Vector3D;
  eventSystem: EventSystem;

  constructor(eventSystem: EventSystem, viewport: Viewport) {
    Assert.instanceOf("eventSystem", eventSystem, EventSystem);
    Assert.instanceOf("viewport", viewport, Viewport);
    this.eventSystem = eventSystem;
    this.viewport = viewport;

    this.#bindings = new Map();
    this.#pressed = new Map();
    this.#delayedActions = new Map();
    this.#locks = new Map();
    this.#actions = new Map();
    this.mouse = new Vector2D();
    this.accel = new Vector3D();
    this.#using = {
      mouse: false,
      touch: false,
      keyboard: false,
      accelerometer: false,
    };
  }

  //#region Initialise

  enableMouse() {
    this.#initializeMouseEvents();
  }

  #initializeMouseEvents() {
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

  #initializeTouchEvents() {
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

  #initializeKeyboardEvents() {
    if (this.#using.keyboard) return;
    this.#using.keyboard = true;

    document.addEventListener("keydown", (e) => this.#onKeyDown(e));
    document.addEventListener("keyup", (e) => this.#onKeyUp(e));
  }

  #initializeAccelerometer() {
    if (this.#using.accelerometer) return;
    this.#using.accelerometer = true;
    window.addEventListener("devicemotion", (e) => this.onDeviceMotion(e), false);
  }

  #initInputTypeEvents(key: InputKeys) {
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
  bind(key: InputKeys, action: string) {
    if (this.#bindings.has(key)) console.warn(`${key} was already bound to action ${this.#bindings.get(key)}`);
    this.#bindings.set(key, action);
    this.#initInputTypeEvents(key);
  }

  /** Unbind an action from a key. */
  unbind(key: InputKeys) {
    const action = this.#bindings.get(key);
    if (!action) return;
    this.#delayedActions.set(action, true);
    this.#bindings.delete(key);
  }

  /** Unbind all actions. */
  unbindAll() {
    this.#bindings.clear();
    this.#actions.clear();
    this.#pressed.clear();
    this.#locks.clear();
    this.#delayedActions.clear();
  }

  /** Returns a boolean value indicating whether the input action began being pressed this frame. */
  pressed(action: string) {
    return !!this.#pressed.get(action);
  }

  /** Returns a boolean value indicating whether the input action is currently held down. */
  held(action: string) {
    return !!this.#actions.get(action);
  }

  /** Returns a boolean value indicating whether the input action was released in the last frame. */
  released(action: string) {
    return !!this.#delayedActions.get(action);
  }

  /** Returns the current state of the action (pressed, held, released). */
  state(action: string): { [K in InputBindingType]?: boolean } {
    return {
      pressed: !!this.#pressed.get(action),
      held: !!this.#actions.get(action),
      released: !!this.#delayedActions.get(action),
    };
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
  clearPressed() {
    for (const action of this.#delayedActions.keys()) {
      this.#actions.set(action, false);
      this.#locks.set(action, false);
    }
    this.#delayedActions.clear();
    this.#pressed.clear();
  }

  //#endregion Api

  //#region Events

  #targetIsInputOrText(event: any): boolean {
    const { tagName } = event.target;
    return tagName === "INPUT" || tagName === "TEXTAREA";
  }

  /** @param orPropagate Defaults to true */
  #youShallNotDefault(e: Event, orPropagate?: boolean) {
    e.preventDefault();
    if (orPropagate ?? true === true) e.stopPropagation();
  }

  #getKeyboardAction(e: KeyboardEvent) {
    if (this.#targetIsInputOrText(e)) return null;
    const key = keyboardMap[e.key.toLowerCase() as keyof typeof keyboardMap];
    if (!key) return null;
    return this.#bindings.get(key);
  }

  #onKeyDown(e: KeyboardEvent) {
    const action = this.#getKeyboardAction(e);
    if (!action) return;

    this.#actions.set(action, true);
    if (!this.#locks.get(action)) {
      this.#pressed.set(action, true);
      this.#locks.set(action, true);
    }
    this.#youShallNotDefault(e, false);
  }

  #onKeyUp(e: KeyboardEvent) {
    const action = this.#getKeyboardAction(e);
    if (!action) return;

    this.#delayedActions.set(action, true);
    this.#youShallNotDefault(e, false);
  }

  #onMouseWheel(e: WheelEvent) {
    const scrollAmount = Math.sign(e.deltaY);
    const key = scrollAmount > 0 ? InputKeys.Mouse_WheelDown : InputKeys.Mouse_WheelUp;
    const action = this.#bindings.get(key);
    if (!action) return;

    this.#actions.set(action, true);
    this.#pressed.set(action, true);
    this.#delayedActions.set(action, true);
    this.#youShallNotDefault(e);
  }

  #onMouseMove(e: TouchEvent | MouseEvent) {
    const viewport = this.viewport;
    const internalWidth = viewport.canvas.offsetWidth || viewport.realWidth;
    const scale = viewport.scale * (internalWidth / viewport.realWidth);

    const pos = viewport.canvas.getBoundingClientRect();
    const { clientX, clientY } = "touches" in e ? e.touches[0] : e;
    this.mouse.x = (clientX - pos.left) / scale;
    this.mouse.y = (clientY - pos.top) / scale;
  }

  #getMouseAction(e: MouseEvent) {
    if (this.#targetIsInputOrText(e)) return undefined;
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
    if (!key) return undefined;
    return this.#bindings.get(key);
  }

  #onMouseDown(e: MouseEvent) {
    this.#onMouseMove(e);

    const action = this.#getMouseAction(e);
    if (!action) return;
    this.#actions.set(action, true);
    this.#pressed.set(action, true);
    this.#youShallNotDefault(e);
  }

  #onMouseUp(e: MouseEvent) {
    const action = this.#getMouseAction(e);
    if (!action) return;
    this.#delayedActions.set(action, true);
    this.#youShallNotDefault(e);
  }

  #onTouchStart(e: TouchEvent) {
    if (this.#targetIsInputOrText(e)) return;
    // Focus window element for mouse clicks. Prevents issues when running the game in an iframe.
    if (UserAgent.instance.device.mobile) window.focus();
    this.#onMouseMove(e);

    const action = this.#bindings.get(InputKeys.Touch_Start);
    if (!action) return;
    this.#actions.set(action, true);
    this.#pressed.set(action, true);
    this.#youShallNotDefault(e);
  }

  #onTouchEnd(e: TouchEvent) {
    if (this.#targetIsInputOrText(e)) return;
    const action = this.#bindings.get(InputKeys.Touch_End);
    if (!action) return;
    this.#delayedActions.set(action, true);
    this.#youShallNotDefault(e);
  }

  #onContextMenu(e: MouseEvent) {
    if (this.#bindings.has(InputKeys.Context_Menu)) this.#youShallNotDefault(e);
  }

  onDeviceMotion(e: DeviceMotionEvent) {
    if (e.accelerationIncludingGravity !== null) {
      this.accel.x = e.accelerationIncludingGravity.x ?? undefined;
      this.accel.y = e.accelerationIncludingGravity.y ?? undefined;
      this.accel.z = e.accelerationIncludingGravity.z ?? undefined;
    }
  }

  //#endregion Events
}
