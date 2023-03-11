import { Guard } from "../../lib/sanity/guard.js";
import { GameLogger } from "../../lib/utils/logger.js";
import { keyboardMap } from "./keys.js";

export class InputManager {
  /** @type {import("../system.js").System}} */
  #system;
  constructor(system) {
    Guard.againstNull({ system });
    this.#system = system;
    
    this.mouse = { x: 0, y: 0 };
    this.keyBinds = new Map();
    this.pressed = new Map();

    this.#initializeMouseEvents();
    this.#initializeTouchEvents();
    this.#initializeKeyboardEvents();
  }

  #initializeMouseEvents() {
    const canvas = this.#system.canvas;
    canvas.addEventListener("wheel", (e) => this.mousewheel(e), { passive: false }); // Stops Chrome warning
    canvas.addEventListener("contextmenu", (e) => this.contextmenu(e), false);
    canvas.addEventListener("mousedown", (e) => this.keydown(e), false);
    canvas.addEventListener("mouseup", (e) => this.keyup(e), false);
    canvas.addEventListener("mousemove", (e) => this.mousemove(e), false);
  }

  #initializeTouchEvents() {
    const canvas = this.#system.canvas;
    // Standard
    canvas.addEventListener("touchstart", (e) => this.keydown(e), false);
    canvas.addEventListener("touchend", (e) => this.keyup(e), false);
    canvas.addEventListener("touchcancel", (e) => this.keyup(e), false);
    canvas.addEventListener("touchmove", (e) => this.mousemove(e), false);

    // MS
    canvas.addEventListener("MSPointerDown", (e) => this.keydown(e), false);
    canvas.addEventListener("MSPointerUp", (e) => this.keyup(e), false);
    canvas.addEventListener("MSPointerMove", (e) => this.mousemove(e), false);
    canvas.style.msTouchAction = "none";
  }

  #initializeKeyboardEvents() {
    document.addEventListener("keydown", (e) => this.onKeyDown(e));
    document.addEventListener("keyup", (e) => this.onKeyUp(e));
    // Buttons get stuck in the pressed position if the tab is changed while a key is pressed
    document.addEventListener("visibilitychange", () => this.pressed.clear());
  }

  /**
   * Bind an input key to an action.
   * @param {import("./keys.js").InputKeys} key
   * @param {string} action */
  bind(key, action) {
    if (this.keyBinds.has(key))
      GameLogger.warn(`${key} already bound to action ${this.keyBinds.get(key)}`);
    this.keyBinds.set(key, action);
  }

  onKeyDown(e) {
    const key = keyboardMap[e.key.toLowerCase()];
    if (!key) return;
    this.pressed[key] = true;
  }

  onKeyUp(e) {
    const key = keyboardMap[e.key.toLowerCase()];
    if (!key) return;
    this.pressed[key] = false;
  }

  contextMenu(e) {
    console.log(e);
  }

  getPressed() {
    return this.pressed;
  }
}
