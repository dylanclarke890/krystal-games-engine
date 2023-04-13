export class Assert {
  static #defaultTypeError(value: string, type: string): string {
    return `${value} was not of type '${type}'.`;
  }

  static string(name: string, value: unknown, message?: string): asserts value is string {
    if (typeof value !== "string")
      throw new AssertionError(message ?? Assert.#defaultTypeError(name, "string"));
  }

  static number(name: string, value: unknown, message?: string): asserts value is number {
    if (typeof value !== "number")
      throw new AssertionError(message ?? Assert.#defaultTypeError(name, "number"));
  }

  static bool(name: string, value: unknown, message?: string): asserts value is boolean {
    if (typeof value !== "boolean")
      throw new AssertionError(message ?? Assert.#defaultTypeError(name, "boolean"));
  }

  static defined<T>(
    name: string,
    value: T | undefined | null,
    message?: string
  ): asserts value is NonNullable<T> {
    if (value === null || value === undefined)
      throw new AssertionError(message ?? `${name} was not defined.`);
  }

  static instanceOf<T extends Function>(
    name: string,
    value: unknown,
    other: T,
    message?: string
  ): asserts value is T {
    this.defined(name, value);
    if (!(value instanceof other))
      throw new AssertionError(message ?? `${name} is not an instanceof ${other?.name}`);
  }
}

class AssertionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AssertionError";
  }
}
