class Assert {
  static #defaultTypeError<T>(value: T, type: string): string {
    return `${value} was not of type '${type}'.`;
  }

  static string(value: unknown, message?: string): asserts value is string {
    if (typeof value !== "string")
      throw new AssertionError(message ?? Assert.#defaultTypeError(value, "string"));
  }

  static number(value: unknown, message?: string): asserts value is number {
    if (typeof value !== "number")
      throw new AssertionError(message ?? Assert.#defaultTypeError(value, "number"));
  }

  static bool(value: unknown, message?: string): asserts value is boolean {
    if (typeof value !== "boolean")
      throw new AssertionError(message ?? Assert.#defaultTypeError(value, "boolean"));
  }

  static instance<T extends Function>(
    value: unknown,
    other: T,
    message?: string
  ): asserts value is T {
    if (!(value instanceof other))
      throw new AssertionError(message ?? `${value} is not an instanceof ${other?.name}`);
  }
}

class AssertionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AssertionError";
  }
}