/** Helper class for validation. */
export class Guard {
  static #getKeyValue(keyValue: any) {
    if (!keyValue) throw new TypeError(`Non object passed: ${keyValue}`);
    const key = Object.keys(keyValue)[0];
    const value = keyValue[key];
    return { key, value };
  }

  /**
   * Throws an error if 'keyValue' is null. Variables to validate must be passed wrapped in an object.
   * @example Guard.againstNull({ valueToCheck });
   */
  static againstNull(keyValue: any) {
    const { key, value } = this.#getKeyValue(keyValue);
    if (value == null) throw new Error(`"${key}" is required.`);
    return {
      isInstanceOf: (instance: any) => this.isInstanceOf(keyValue, instance),
      isTypeOf: (type: DataType) => this.isTypeOf(keyValue, type),
    };
  }

  /**
   * Throws an error if 'keyValue' is not of the specified 'type'. Variables to validate must be passed wrapped
   * in an object.
   * @param {"function" | "object" | "number" | "string" | "boolean" | "undefined" | "bigint" | "symbol"} type
   * @example Guard.isTypeOf({ valueToCheck }, "string");
   */
  static isTypeOf(keyValue: any, type: DataType) {
    const { key, value } = this.#getKeyValue(keyValue);
    if (typeof value !== type) throw new TypeError(`${key} must be of type "${type}."`);
  }

  /**
   * Throws an error if 'keyValue' is not an instance of 'instanceOf'. Variables to validate must be passed
   * wrapped in an object.
   * @example Guard.isInstanceOf({ valueToCheck }, ClassDefinition);
   */
  static isInstanceOf(keyValue: any, instanceOf: any) {
    const { key, value } = this.#getKeyValue(keyValue);
    if (!(value instanceof instanceOf))
      throw new TypeError(`${key} must be an instance of "${instanceOf.name}".`);
  }
}

type DataType =
  | "bigint"
  | "boolean"
  | "function"
  | "number"
  | "object"
  | "string"
  | "symbol"
  | "undefined";
