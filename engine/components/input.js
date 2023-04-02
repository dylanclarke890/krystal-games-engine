export class Input {
  /** @type {string, Function} */
  bindings;

  /**
   * @param {Map<string, Function>} bindings
   */
  constructor(bindings) {
    this.bindings = bindings;
  }

  /**
   * @param {string} name
   * @param {Function} action
   */
  bind(name, action) {
    this.bindings.set(name, action);
  }
}
