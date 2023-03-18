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
      if (!(value instanceof this)) continue;
      enumKeys.push(key);
      value.enumKey = key;
      value.enumOrdinal = enumValues.length;
      enumValues.push(value);
    }

    this.enumKeys = enumKeys;
    this.enumValues = enumValues;
    Object.freeze(this);
  }

  static [Symbol.iterator]() {
    return this.enumValues[Symbol.iterator]();
  }

  /**
   * @param {string} str
   * @returns {Enum|undefined}
   */
  static from(str) {
    const index = this.enumKeys.indexOf(str);
    return index >= 0 ? this.enumValues[index] : undefined;
  }

  static toString() {
    const entries = Object.entries(this)
      .filter(([, value]) => value instanceof this)
      .map(([key, value]) => `${key}: ${value.enumOrdinal}`)
      .join(", ");

    return `${this.name}: {${entries}}`;
  }

  /** @type {string} */
  enumKey;
  /** @type {number} */
  enumOrdinal;
  /** @type {number|any} */
  #value;

  /**
   * @param {number|any} [value] Optional value to use instead of the enum's index.
   * Recommended to be a number for consistency but can technically be anything.
   */
  constructor(value) {
    this.#value = value;
  }

  toString() {
    return `${this.constructor.name}.${this.enumKey}`;
  }

  valueOf() {
    return this.#value !== undefined ? this.#value : this.enumOrdinal;
  }
}
