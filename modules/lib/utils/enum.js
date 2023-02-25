export class Enum {
  /** @type {string[]} */
  static enumKeys;
  /** @type {Enum[]} */
  static enumValues;

  static freeze() {
    /** @type {string[]} */
    const enumKeys = [];
    /** @type {Enum[]} */
    const enumValues = [];
    // Traverse the enum entries
    for (const [key, value] of Object.entries(this)) {
      enumKeys.push(key);

      value.enumKey = key;
      value.enumOrdinal = enumValues.length;
      enumValues.push(value);
    }

    // Important: only add more static properties *after* processing the enum entries
    this.enumKeys = enumKeys;
    this.enumValues = enumValues;
    Object.freeze(this);
  }

  /**
   * @param {string} str
   * @returns {undefined|Enum}
   */
  static enumValueOf(str) {
    const index = this.enumKeys.indexOf(str);
    return index >= 0 ? this.enumValues[index] : undefined;
  }

  static [Symbol.iterator]() {
    return this.enumValues[Symbol.iterator]();
  }

  /** @type {string} */
  enumKey;
  /** @type {number} */
  enumOrdinal;

  toString() {
    return `${this.constructor.name}.${this.enumKey}`;
  }

  valueOf() {
    return this.enumOrdinal;
  }

  static toString() {
    const entries = Object.entries(this)
      .filter(([, value]) => value instanceof this)
      .map(([key, value]) => `${key}: ${value.enumOrdinal}`)
      .join(", ");

    return `${this.name}: {${entries}}`;
  }
}
