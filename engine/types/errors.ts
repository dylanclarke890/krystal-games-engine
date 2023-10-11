class GameError<T> extends Error {
  data?: T;

  constructor(name: string, message: string, data?: T) {
    super(message);
    this.name = name + "Error";
    this.data = data;
  }
}

export class AssertionError<T> extends GameError<T> {
  constructor(message: string, data?: T) {
    super("Assertion", message, data);
  }
}

export class InvalidOperationError<T> extends GameError<T> {
  constructor(message: string, data?: T) {
    super("InvalidOperation", message, data);
  }
}

export class NotImplementedError<T> extends GameError<T> {
  constructor(message: string, data?: T) {
    super("NotImplemented", message, data);
  }
}

export class IntervalParsingFailedError<T> extends GameError<T> {
  constructor(message: string, data?: T) {
    super("IntervalParsingFailed", message, data);
  }
}

export class SystemError<T> extends GameError<T> {
  constructor(message: string, data?: T) {
    super("System", message, data);
  }
}

export class EntityCreationError<T> extends GameError<T> {
  constructor(message: string, data?: T) {
    super("EntityCreation", message, data);
  }
}