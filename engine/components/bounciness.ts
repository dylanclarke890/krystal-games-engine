import { ScalarValue } from "../utils/scalar-value.js";

export class Bounciness extends ScalarValue {
  constructor(value: number) {
    super(value, 0, 1);
  }
}
