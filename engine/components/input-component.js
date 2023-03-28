export class InputComponent {
  bindings;

  /**
   * @param {Map<import("../input/input-keys.js").InputKeys, Function>} bindings
   */
  constructor(bindings) {
    this.bindings = bindings;
  }

  /**
   * @param {import("../input/input-keys.js").InputKeys} name
   * @param {Function} action
   */
  bind(name, action) {
    this.bindings.set(name, action);
  }
}