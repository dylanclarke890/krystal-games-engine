/** Helper class for validation. */
export class Guard {
  static #getKeyValue(keyValue) {
    if (!keyValue) throw new TypeError(`Non object passed: ${keyValue}`);
    const key = Object.keys(keyValue)[0];
    const value = keyValue[key];
    return { key, value };
  }

  /**
   * Throws an error if 'keyValue' is null. Variables to validate must be passed wrapped in an object.
   * @example Guard.againstNull({ valueToCheck });
   */
  static againstNull(keyValue) {
    const { key, value } = this.#getKeyValue(keyValue);
    if (value == null) throw new Error(`"${key}" is required.`);
    return {
      isInstanceOf: (instance) => this.isInstanceOf(keyValue, instance),
      /** @type {"function" | "object" | "number" | "string" | "boolean" | "undefined" | "bigint" | "symbol"} */
      isTypeOf: (type) => this.isTypeOf(keyValue, type),
    };
  }

  /**
   * Throws an error if 'keyValue' is not of the specified 'type'. Variables to validate must be passed wrapped
   * in an object.
   * @param {"function" | "object" | "number" | "string" | "boolean" | "undefined" | "bigint" | "symbol"} type
   * @example Guard.isTypeOf({ valueToCheck }, "string");
   */
  static isTypeOf(keyValue, type) {
    const { key, value } = this.#getKeyValue(keyValue);
    if (typeof value !== type) throw new TypeError(`${key} must be of type "${type}."`);
  }

  /**
   * Throws an error if 'keyValue' is not an instance of 'instanceOf'. Variables to validate must be passed
   * wrapped in an object.
   * @example Guard.isInstanceOf({ valueToCheck }, ClassDefinition);
   */
  static isInstanceOf(keyValue, instanceOf) {
    const { key, value } = this.#getKeyValue(keyValue);
    if (!(value instanceof instanceOf))
      throw new TypeError(`${key} must be an instance of "${instanceOf.name}".`);
  }
}
