import { randomInt } from "./number.js";
import { parseJSON } from "./string.js";

export class ScalarValue {
  value: number;
  min?: number;
  max?: number;

  constructor(value?: number, min?: number, max?: number) {
    this.value = value ?? 0;
    this.min = min;
    this.max = max;
    this.#constrain();
  }

  set(value: number) {
    this.value = value;
    this.#constrain();
    return this;
  }

  add(value: number) {
    this.value += value;
    this.#constrain();
    return this;
  }

  sub(value: number) {
    this.value -= value;
    this.#constrain();
    return this;
  }

  div(value: number) {
    if (value !== 0) {
      this.value /= value;
    }
    this.#constrain();
    return this;
  }

  mul(value: number) {
    this.value *= value;
    this.#constrain();
    return this;
  }

  floor() {
    this.value = Math.floor(this.value);
    return this;
  }

  round() {
    this.value = Math.round(this.value);
    return this;
  }

  ceil() {
    this.value = Math.ceil(this.value);
    return this;
  }

  /** Randomizes value to be between min and max if set. */
  randomize(min = this.min, max = this.max) {
    if (typeof min === "number" && typeof max === "number") {
      this.value = randomInt(min, max);
      this.#constrain();
    }

    return this;
  }

  assign(other: ScalarValue) {
    this.value = other.value;
    this.min = other.min;
    this.max = other.max;
    return this;
  }

  serialize(): string {
    return JSON.stringify(this);
  }

  deserialize(data: string): void {
    const parsed = parseJSON<ScalarValue>(data);
    this.assign(parsed);
    this.#constrain();
  }

  #constrain() {
    if (typeof this.min !== "undefined" && this.min > this.value) {
      this.value = this.min;
    }

    if (typeof this.max !== "undefined" && this.max < this.value) {
      this.value = this.max;
    }
  }
}
