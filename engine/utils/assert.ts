import { AssertionError } from "./errors.js";

export class Assert {
  static #defaultTypeError(value: string, type: string): string {
    return `${value} was not of type '${type}'.`;
  }

  static string(name: string, value: unknown, message?: string): asserts value is string {
    if (typeof value !== "string") {
      throw new AssertionError(message ?? Assert.#defaultTypeError(name, "string"), value);
    }
  }

  static number(name: string, value: unknown, message?: string): asserts value is number {
    if (typeof value !== "number") {
      throw new AssertionError(message ?? Assert.#defaultTypeError(name, "number"), value);
    }
  }

  static bool(name: string, value: unknown, message?: string): asserts value is boolean {
    if (typeof value !== "boolean") {
      throw new AssertionError(message ?? Assert.#defaultTypeError(name, "boolean"), value);
    }
  }

  static defined<T>(name: string, value: Nullable<T> | null, message?: string): asserts value is NonNullable<T> {
    if (value === null || typeof value === "undefined") {
      throw new AssertionError(message ?? `${name} was not defined.`, value);
    }
  }

  static instanceOf<T extends abstract new (...args: any) => any>(
    name: string,
    value: unknown,
    other: T,
    message?: string
  ): asserts value is InstanceType<T> {
    this.defined(name, value);

    if (!(value instanceof other)) {
      throw new AssertionError(message ?? `${name} is not an instanceof ${other?.name}`, value);
    }
  }
}
