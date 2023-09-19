import { ScalarValue } from "../utils/scalar-value.js";

export class GravityFactor extends ScalarValue {
  constructor(value?: number) {
    super(value ?? 9.81);
  }
}
