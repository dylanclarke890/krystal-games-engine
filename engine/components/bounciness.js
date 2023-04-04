import { constrain } from "../utils/number.js";

export class Bounciness {
  /** @type {number} */
  value;

  /**
   * @param {number} value number between 0 and 1.
   */
  constructor(value) {
    this.value = constrain(value, 0, 1);
  }
}
