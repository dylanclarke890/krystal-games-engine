import { Guard } from "../../lib/sanity/guard.js";
import { GameLogger } from "../../lib/utils/logger.js";
import { InputKeys, keyboardMap } from "./keys.js";

export class InputManager {
  /** @type {import("../system.js").System}} */
  #system;

  /** @type {Map<InputKeys, boolean>} */
  #pressed;
  /** @type {Map<InputKeys, string>} */
  #bindings;
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
    // Buttons get stuck in the pressed position if the tab is changed while a key is pressed
    document.addEventListener("visibilitychange", () => this.pressed.clear());
  }
  //#endregion Initialise

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
   * Unbind an input key from an action.
   * @param {InputKeys} key
   */
  unbind(key) {
    const action = this.#bindings.get(key);
    if (!action) return;
    this.#delayedActions.set(action, true);
    this.#bindings.delete(key);
  }

  unbindAll() {
    this.#bindings.clear();
    this.#actions.clear();
    this.#pressed.clear();
    this.#locks.clear();
    this.#delayedActions.clear();
  }

  pressed(action) {
    return !!this.#pressed[action];
  }

  state(action) {
    return !!this.#actions[action];
  }

  released(action) {
    return !!this.#delayedActions[action];
  }

  clearPressed() {
    for (const action of this.#delayedActions.keys()) {
      this.#actions.set(action, false);
      this.#locks.set(action, false);
    }
    this.#delayedActions.clear();
    this.#pressed.clear();
  }

  //#region Events
  /**
   * @param {Event} event
   * @returns {boolean}
   */
  #targetIsInputOrText(event) {
    const { tagName } = event.target;
    return tagName === "INPUT" || tagName === "TEXTAREA";
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
    e.preventDefault();
  }

  /** @param {KeyboardEvent} e */
  #onKeyUp(e) {
    const action = this.#getKeyboardAction(e);
    if (!action) return;

    this.#delayedActions.set(action, true);
    e.preventDefault();
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

    e.stopPropagation();
    e.preventDefault();
  }

  /** @param {MouseEvent} e */
  #onMouseMove(e) {
    const system = this.#system;
    const internalWidth = system.canvas.offsetWidth || system.realWidth;
    const scale = system.scale * (internalWidth / system.realWidth);

    const pos = system.canvas.getBoundingClientRect();
    const { clientX, clientY } = e.touches ? e.touches[0] : e;
    this.mouse.x = (clientX - pos.left) / scale;
    this.mouse.y = (clientY - pos.top) / scale;
  }

  /** @param {MouseEvent} e */
  #onMouseDown(e) { }
  
  /** @param {MouseEvent} e */
  #onMouseUp(e) { }
  
  /** @param {TouchEvent} e */
  #onTouchStart(e) {}
  
  /** @param {TouchEvent} e */
  #onTouchEnd(e) {}

  #onContextMenu(e) {
    if (!this.#bindings.has(InputKeys.Context_Menu)) return;
    e.stopPropagation();
    e.preventDefault();
  }
  //#endregion Events
}
