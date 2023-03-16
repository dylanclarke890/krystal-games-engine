export class VelocityComponent {
  /** @type {number} */
  x;
  /** @type {number} */
  y;

  constructor(x, y) {
    this.x = x || 0;
    this.y = y || 0;
  }

  /**
   * @param {number} x
   * @param {number} y
   */
  set(x, y) {
    this.x = x;
    this.y = y;
  }
}
