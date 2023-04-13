class Assert {
  static isString(value?: unknown, message?: string): asserts value is string {
    if (typeof value !== "string")
      throw new AssertionError(message ?? `${value} was not of type 'string'.`);
  }
}

class AssertionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AssertionError";
  }
}
