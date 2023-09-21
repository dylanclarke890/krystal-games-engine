class GameError<T> extends Error {
  data?: T;

  constructor(name: string, message: string, data?: T) {
    super(message);
    this.name = name;
    this.data = data;
    this.stack = new Error().stack;
  }
}

export class AssertionError<T> extends GameError<T> {
  constructor(message: string, data?: T) {
    super("AssertionError", message, data);
  }
}

export class InvalidOperationError<T> extends GameError<T> {
  constructor(message: string, data?: T) {
    super("InvalidOperationError", message, data);
  }
}

export class IntervalParsingFailedError<T> extends GameError<T> {
  constructor(message: string, data?: T) {
    super("IntervalParsingFailedError", message, data);
  }
}
