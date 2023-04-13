type Primitive = number | string | undefined | bigint | boolean;
type TypeOf = "number" | "string" | "boolean" | "object" | "function" | 

typeof "" === "boolean"
class Assert {
  static areEqual(expected: Primitive, actual: Primitive, message = "Values are not equal") {
    if (expected !== actual) {
      throw new AssertionError(message);
    }
  }

  static isTrue(value: boolean, message = "Value is not true"): asserts value is true {
    if (value !== true) {
      throw new AssertionError(message);
    }
  }

  static isFalse(value: boolean, message = "Value is not false"): asserts value is false {
    if (value !== false) {
      throw new AssertionError(message);
    }
  }

  static isNull(value: null | unknown, message = "Value is not null"): asserts value is null {
    if (value !== null) {
      throw new AssertionError(message);
    }
  }

  static isNotNull(value: string, message = "Value is null") {
    if (value === null) {
      throw new AssertionError(message);
    }
  }

  static isUndefined(value: string, message = "Value is not undefined") {
    if (value !== undefined) {
      throw new AssertionError(message);
    }
  }

  static isNotUndefined(value: string, message = "Value is undefined") {
    if (value === undefined) {
      throw new AssertionError(message);
    }
  }
}

class AssertionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AssertionError";
  }
}
