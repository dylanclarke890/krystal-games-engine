export class InputSystem {
  constructor() {
    this.mouse = { x: 0, y: 0 };
    this.keyBinds = {};
    this.pressed = {};
    this.#bindEvents();
  }

  #bindEvents() {
    document.addEventListener("keydown", (e) => this.onKeyDown(e));
    document.addEventListener("keyup", (e) => this.onKeyUp(e));
  }

  onKeyDown(e) {
    this.pressed[e.key] = true;
  }

  onKeyUp(e) {
    this.pressed[e.key] = false;
  }

  contextMenu(e) {
    console.log(e);
  }

  getPressed() {
    return this.pressed;
  }
}
