import { constrain } from "../utils/number.js";

export class Bounciness {
  /** @type {number} */
  x;
  /** @type {number} */
  y;
  /** @type {number} */
  minVelX;
  /** @type {number} */
  minVelY;

  /**
   * @param {number} x number between 0 and 1.
   * @param {number} y number between 0 and 1.
   * @param {number} minVelX minimum velocity required for a bounce, else velocity will be set to 0.
   * @param {number} minVelY minimum velocity required for a bounce, else velocity will be set to 0.
   */
  constructor(x, y, minVelX, minVelY) {
    this.x = constrain(x, 0, 1);
    this.y = constrain(y, 0, 1);
    this.minVelX = minVelX;
    this.minVelY = minVelY;
  }
}
