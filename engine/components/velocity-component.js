export class VelocityComponent {
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
    this.maxX = maxX || Infinity;
    this.maxY = maxY || Infinity;
  }

  /**
   * @param {number} dx
   * @param {number} dy
   */
  add(dx, dy) {
    this.x = Math.min(this.x + dx, this.maxX);
    this.y = Math.min(this.y + dy, this.maxY);
  }

  /**
   * @param {number} dx
   * @param {number} dy
   */
  subtract(dx, dy) {
    this.x = Math.max(this.x - dx, -this.maxX);
    this.y = Math.max(this.y - dy, -this.maxY);
  }
}
