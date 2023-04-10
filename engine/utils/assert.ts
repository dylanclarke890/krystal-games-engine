export class Assert {
  static isType(val: any, type: DataType) {
    return typeof val === type;
  }

  static isInstanceOf(val: any, type: any) {
    return val instanceof type;
  }

  static isEqual(a: any, b: any, strict?: boolean) {
    strict ??= true; // true unless explicitly set
    return strict ? a === b : a == b;
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
