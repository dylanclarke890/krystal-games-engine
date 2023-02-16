export class Assert {
  static isType(val, type) {
    return typeof val === type;
  }

  static isInstanceOf(val, type) {
    return val instanceof type;
  }

  /**
   * @param {*} a
   * @param {*} b
   * @param {[boolean]} strict
   */
  static isEqual(a, b, strict) {
    strict ??= true; // true unless explicitly set
    return strict ? a === b : a == b;
  }
}
