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

  constructor(system) {
    Guard.againstNull({ system });
    this.#system = system;

    this.mouse = { x: 0, y: 0 };
    this.#bindings = new Map();
    this.#pressed = new Map();

    this.#initializeMouseEvents();
    this.#initializeTouchEvents();
    this.#initializeKeyboardEvents();
  }

  //#region Initialise
  #initializeMouseEvents() {
    const canvas = this.#system.canvas;
    canvas.addEventListener("wheel", (e) => this.#onMouseWheel(e), { passive: false }); // Stops Chrome warning
    canvas.addEventListener("contextmenu", (e) => this.#onContextMenu(e), false);
    canvas.addEventListener("mousedown", (e) => this.#onKeyDown(e), false);
    canvas.addEventListener("mouseup", (e) => this.#onKeyUp(e), false);
    canvas.addEventListener("mousemove", (e) => this.#onMouseMove(e), false);
  }

  #initializeTouchEvents() {
    const canvas = this.#system.canvas;
    // Standard
    canvas.addEventListener("touchstart", (e) => this.#onKeyDown(e), false);
    canvas.addEventListener("touchend", (e) => this.#onKeyUp(e), false);
    canvas.addEventListener("touchcancel", (e) => this.#onKeyUp(e), false);
    canvas.addEventListener("touchmove", (e) => this.#onMouseMove(e), false);

    // MS
    canvas.addEventListener("MSPointerDown", (e) => this.#onKeyDown(e), false);
    canvas.addEventListener("MSPointerUp", (e) => this.#onKeyUp(e), false);
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
   * @param {import("./keys.js").InputKeys} key
   * @param {string} action
   */
  bind(key, action) {
    if (this.#bindings.has(key))
      GameLogger.warn(`${key} already bound to action ${this.#bindings.get(key)}`);
    this.#bindings.set(key, action);
  }

  getPressed() {
    return this.#pressed;
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

  #onKeyDown(e) {
    if (this.#targetIsInputOrText(e)) return;
    const key = keyboardMap[e.key.toLowerCase()];
    if (!key) return;
    this.#pressed.set(key, true);
  }

  #onKeyUp(e) {
    if (this.#targetIsInputOrText(e)) return;
    const key = keyboardMap[e.key.toLowerCase()];
    if (!key) return;
    this.#pressed.set(key, false);
  }

  #onMouseWheel(e) {
    const scrollAmount = Math.sign(e.deltaY);
    const action = this.#bindings.get(InputKeys.Mouse_WheelUp);

    if (scrollAmount > 0 && this.#bindings[InputKeys.Mouse_WheelDown]) {
      this.#pressed.set(InputKeys.Mouse_WheelDown, true);
    } else if (scrollAmount < 0 && this.#bindings[InputKeys.Mouse_WheelUp]) {
      this.#pressed.set(InputKeys.Mouse_WheelUp, true);
    }

    if (action) {
      e.preventDefault();
      e.stopPropagation();
    }
  }

  #onMouseMove(e) {
    const system = this.#system;
    const internalWidth = system.canvas.offsetWidth || system.realWidth;
    const scale = system.scale * (internalWidth / system.realWidth);

    const pos = system.canvas.getBoundingClientRect();
    const { clientX, clientY } = e.touches ? e.touches[0] : e;
    this.mouse.x = (clientX - pos.left) / scale;
    this.mouse.y = (clientY - pos.top) / scale;
  }

  #onContextMenu(e) {
    if (!this.#bindings[InputKeys.Context_Menu]) return;
    e.stopPropagation();
    e.preventDefault();
  }
  //#endregion Events
}
