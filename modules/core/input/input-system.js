import { keyboardMap } from "./keys.js";

export class InputSystem {
  constructor() {
    this.mouse = { x: 0, y: 0 };
    this.keyBinds = new Map();
    this.pressed = new Map();
    this.#bindEvents();
  }

  #bindEvents() {
    document.addEventListener("keydown", (e) => this.onKeyDown(e));
    document.addEventListener("keyup", (e) => this.onKeyUp(e));
    // Buttons get stuck in the pressed position if the tab is changed while a key is pressed
    document.addEventListener("visibilitychange", () =>
      Object.keys(this.pressed).forEach((key) => (this.pressed[key] = false))
    );
  }

  bind(key, action) {}

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
