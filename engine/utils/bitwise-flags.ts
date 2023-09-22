import { Enum } from "./enum.js";

export class BitwiseFlags<TFlags extends Record<string, number>> {
  // TODO: do we need this?
  static create<T extends Record<string, number> | typeof Enum>(obj: T): BitwiseFlags<Record<string, number>> {
    const instance = new BitwiseFlags<Record<string, number>>();

    if (obj.prototype instanceof Enum) {
      for (const enumInstance of (obj as typeof Enum).enumValues) {
        instance.add(enumInstance.valueOf());
      }
    } else {
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          instance.add(obj[key] as number);
        }
      }
    }

    return instance;
  }

  flags: number;

  constructor() {
    this.flags = 0;
  }

  add<TKey extends keyof TFlags>(flag: TFlags[TKey]) {
    this.flags |= flag;
  }

  remove<TKey extends keyof TFlags>(flag: TFlags[TKey]) {
    this.flags &= ~flag;
  }

  has<TKey extends keyof TFlags>(flag: TFlags[TKey]) {
    return (this.flags & flag) === flag;
  }

  clear() {
    this.flags = 0;
  }

  isSet() {
    return this.flags !== 0;
  }
}
