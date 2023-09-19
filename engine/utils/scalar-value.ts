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

  #constrain() {
    if (typeof this.min !== "undefined" && this.min > this.value) {
      this.value = this.min;
    }

    if (typeof this.max !== "undefined" && this.max < this.value) {
      this.value = this.max;
    }
  }
}
