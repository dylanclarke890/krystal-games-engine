import { constrain } from "../utils/number.js";

export class Bounciness {
  /** @type {number} */
  x;
  /** @type {number} */
  y;

  /**
   * @param {number} x number between 0 and 1.
   * @param {number} y number between 0 and 1.
   */
  constructor(x, y) {
    this.x = constrain(x, 0, 1);
    this.y = constrain(y, 0, 1);
  }
}
