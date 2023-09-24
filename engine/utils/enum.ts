export class Enum {
  static enumKeys: string[];
  static enumValues: Enum[];

  static freeze() {
    const enumKeys: string[] = [];
    const enumValues: Enum[] = [];
    // Traverse the enum entries
    for (const [key, value] of Object.entries(this).filter(([, value]) => value instanceof this)) {
      enumKeys.push(key);
      value.enumKey = key;
      value.enumOrdinal = enumValues.length;
      enumValues.push(value);
    }

    this.enumKeys = enumKeys;
    this.enumValues = enumValues;
    Object.freeze(this);
  }

  static [Symbol.iterator]() {
    return this.enumValues[Symbol.iterator]();
  }

  static from(str: string): Nullable<Enum> {
    const index = this.enumKeys.indexOf(str);
    return index >= 0 ? this.enumValues[index] : undefined;
  }

  static toString(): string {
    const entries = Object.entries(this)
      .filter(([, value]) => value instanceof this)
      .map(([key, value]) => `${key}: ${value.enumOrdinal}`)
      .join(", ");

    return `${this.name}: {${entries}}`;
  }

  enumKey!: string;
  enumOrdinal!: number;
  #value: Nullable<number>;

  /**
   * @param value Optional value to use instead of the enum's index.
   * Recommended to be a number for consistency but can technically be anything.
   */
  constructor(value?: number) {
    this.#value = value;
  }

  toString() {
    return `${this.constructor.name}.${this.enumKey}`;
  }

  valueOf() {
    return this.#value ?? this.enumOrdinal;
  }
}
