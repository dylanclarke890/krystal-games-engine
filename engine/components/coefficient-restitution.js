import { constrain } from "../utils/number.js";

export class CoeffRestitution {
  /** @type {number} */
  value;

  /**
   * @param {number} value 0 for non elastic, 1 for elastic.
   */
  constructor(value) {
    this.value = constrain(value, 0, 1);
  }
}
