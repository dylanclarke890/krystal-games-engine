export class Input {
  bindings: Map<string, Function>;

  /**
   * @param {Map<string, Function>} bindings
   */
  constructor(bindings: Map<string, Function>) {
    this.bindings = bindings;
  }

  /**
   * @param {string} name
   * @param {Function} action
   */
  bind(name: string, action: Function) {
    this.bindings.set(name, action);
  }
}
