export class Velocity {
  x;
  y;
  maxX;
  maxY;

  /**
   * @param {number} x
   * @param {number} y
   * @param {number} maxX
   * @param {number} maxY
   */
  constructor(x, y, maxX, maxY) {
    this.x = x || 0;
    this.y = y || 0;
    this.maxX = maxX || x || 0;
    this.maxY = maxY || y || 0;
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
