import { Guard } from "../../lib/sanity/guard.js";
import { GameLogger } from "../../lib/utils/logger.js";
import { UserAgent } from "../../lib/utils/user-agent.js";
import { InputKeys, keyboardMap } from "./keys.js";

export class InputManager {
  /** @type {import("../system.js").System}} */
  #system;

  /** @type {Map<InputKeys, string>} */
  #bindings;
  /** @type {Map<string, boolean>} */
  #pressed;
  /** @type {Map<string, boolean>} */
  #delayedActions;
  /** @type {Map<string, boolean>} */
  #locks;
  /** @type {Map<string, boolean>} */
  #actions;

  /** @type {{x:number, y:number}} */
  mouse;

  constructor(system) {
    Guard.againstNull({ system });
    this.#system = system;

    this.#bindings = new Map();
    this.#pressed = new Map();
    this.#delayedActions = new Map();
    this.#locks = new Map();
    this.#actions = new Map();

    this.mouse = { x: 0, y: 0 };

    this.#initializeMouseEvents();
    this.#initializeTouchEvents();
    this.#initializeKeyboardEvents();
  }

  //#region Initialise

  #initializeMouseEvents() {
    const canvas = this.#system.canvas;
    canvas.addEventListener("wheel", (e) => this.#onMouseWheel(e), { passive: false }); // Stops Chrome warning
    canvas.addEventListener("contextmenu", (e) => this.#onContextMenu(e), false);
    canvas.addEventListener("mousedown", (e) => this.#onMouseDown(e), false);
    canvas.addEventListener("mouseup", (e) => this.#onMouseUp(e), false);
    canvas.addEventListener("mousemove", (e) => this.#onMouseMove(e), false);
  }

  #initializeTouchEvents() {
    if (!UserAgent.instance.device.touchDevice) return;
    const canvas = this.#system.canvas;
    // Standard
    canvas.addEventListener("touchstart", (e) => this.#onTouchStart(e), false);
    canvas.addEventListener("touchend", (e) => this.#onTouchEnd(e), false);
    canvas.addEventListener("touchcancel", (e) => this.#onTouchEnd(e), false);
    canvas.addEventListener("touchmove", (e) => this.#onMouseMove(e), false);

    // MS
    canvas.addEventListener("MSPointerDown", (e) => this.#onTouchStart(e), false);
    canvas.addEventListener("MSPointerUp", (e) => this.#onTouchEnd(e), false);
    canvas.addEventListener("MSPointerMove", (e) => this.#onMouseMove(e), false);
    canvas.style.msTouchAction = "none";
  }

  #initializeKeyboardEvents() {
    document.addEventListener("keydown", (e) => this.#onKeyDown(e));
    document.addEventListener("keyup", (e) => this.#onKeyUp(e));
  }

  //#endregion Initialise

  //#region Api

  /**
   * Bind an input key to an action.
   * @param {InputKeys} key
   * @param {string} action
   */
  bind(key, action) {
    if (this.#bindings.has(key))
      GameLogger.warn(`${key} already bound to action ${this.#bindings.get(key)}`);
    this.#bindings.set(key, action);
  }

  /**
   * Unbind an action from a key.
   * @param {InputKeys} key
   */
  unbind(key) {
    const action = this.#bindings.get(key);
    if (!action) return;
    this.#delayedActions.set(action, true);
    this.#bindings.delete(key);
  }

  /**
   * Unbind all actions.
   */
  unbindAll() {
    this.#bindings.clear();
    this.#actions.clear();
    this.#pressed.clear();
    this.#locks.clear();
    this.#delayedActions.clear();
  }

  /**
   * Returns a boolean value indicating whether the input action began being pressed this frame.
   * @param {string} action The string representing the input action to check.
   */
  pressed(action) {
    return !!this.#pressed.get(action);
  }

  /**
   * Returns a boolean value indicating whether the input action is currently in a state of being pressed.
   * @param {string} action The string representing the input action to check.
   */
  state(action) {
    return !!this.#actions.get(action);
  }

  /**
   * Returns a boolean value indicating whether the input action was released in the last frame.
   * @param {string} action The string representing the input action to check.
   */
  released(action) {
    return !!this.#delayedActions.get(action);
  }

  /**
   * Clears any inputs that were pressed in the previous frame and updates the state of the inputs.
   *
   * This method should be called at the start of each game frame, before any input processing is done.
   *
   * Any inputs that were released in the previous frame will still be stored in the delayedActions map and can be
   * checked using `released()`.
   *
   * After calling this method, `pressed()` will return false for all inputs that were pressed in the previous
   * frame.
   *
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

  /**
   * @param {Event} event
   * @returns {boolean}
   */
  #targetIsInputOrText(event) {
    const { tagName } = event.target;
    return tagName === "INPUT" || tagName === "TEXTAREA";
  }

  /**
   * @param {Event} e
   * @param {[boolean]} orPropagate Defaults to true
   */
  #youShallNotDefault(e, orPropagate) {
    e.preventDefault();
    if (orPropagate ?? true === true) e.stopPropagation();
  }

  /** @param {KeyboardEvent} e */
  #getKeyboardAction(e) {
    if (this.#targetIsInputOrText(e)) return null;
    const key = keyboardMap[e.key.toLowerCase()];
    if (!key) return null;
    return this.#bindings.get(key);
  }

  /** @param {KeyboardEvent} e */
  #onKeyDown(e) {
    const action = this.#getKeyboardAction(e);
    if (!action) return;

    this.#actions.set(action, true);
    if (!this.#locks.has(action)) {
      this.#pressed.set(action, true);
      this.#locks.set(action, true);
    }
    this.#youShallNotDefault(false);
  }

  /** @param {KeyboardEvent} e */
  #onKeyUp(e) {
    const action = this.#getKeyboardAction(e);
    if (!action) return;

    this.#delayedActions.set(action, true);
    this.#youShallNotDefault(false);
  }

  /** @param {WheelEvent} e */
  #onMouseWheel(e) {
    const scrollAmount = Math.sign(e.deltaY);
    const key = scrollAmount > 0 ? InputKeys.Mouse_WheelDown : InputKeys.Mouse_WheelUp;
    const action = this.#bindings.get(key);
    if (!action) return;

    this.#actions.set(action, true);
    this.#pressed.set(action, true);
    this.#delayedActions.set(action, true);
    this.#youShallNotDefault(e);
  }

  /** @param {TouchEvent|MouseEvent} e */
  #onMouseMove(e) {
    const system = this.#system;
    const internalWidth = system.canvas.offsetWidth || system.realWidth;
    const scale = system.scale * (internalWidth / system.realWidth);

    const pos = system.canvas.getBoundingClientRect();
    const { clientX, clientY } = "touches" in e ? e.touches[0] : e;
    this.mouse.x = (clientX - pos.left) / scale;
    this.mouse.y = (clientY - pos.top) / scale;
  }

  /** @param {MouseEvent} e */
  #getMouseAction(e) {
    if (this.#targetIsInputOrText(e)) return null;
    switch (e.button) {
      case 0:
      case 1:
        return InputKeys.Mouse_BtnOne;
      case 2:
        return InputKeys.Mouse_BtnTwo;
      default:
        return null;
    }
  }

  /** @param {MouseEvent} e */
  #onMouseDown(e) {
    this.#onMouseMove(e);

    const action = this.#getMouseAction(e);
    if (!action) return;
    this.#actions.set(action, true);
    this.#pressed.set(action, true);
    this.#youShallNotDefault(e);
  }

  /** @param {MouseEvent} e */
  #onMouseUp(e) {
    const action = this.#getMouseAction(e);
    if (!action) return;
    this.#delayedActions.set(action, true);
    this.#youShallNotDefault(e);
  }

  /** @param {TouchEvent} e */
  #onTouchStart(e) {
    if (this.#targetIsInputOrText(e)) return null;
    // Focus window element for mouse clicks. Prevents issues when running the game in an iframe.
    if (UserAgent.instance.device.mobile) window.focus();
    this.#onMouseMove(e);

    const action = this.#bindings.get(InputKeys.Touch_Start);
    if (!action) return;
    this.#actions.set(action, true);
    this.#pressed.set(action, true);
    this.#youShallNotDefault(e);
  }

  /** @param {TouchEvent} e */
  #onTouchEnd(e) {
    if (this.#targetIsInputOrText(e)) return null;
    const action = this.#bindings.get(InputKeys.Touch_End);
    if (!action) return;
    this.#delayedActions.set(action, true);
    this.#youShallNotDefault(e);
  }

  /** @param {MouseEvent} e */
  #onContextMenu(e) {
    if (this.#bindings.has(InputKeys.Context_Menu)) this.#youShallNotDefault(e);
  }

  //#endregion Events
}
