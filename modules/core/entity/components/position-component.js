export class PositionComponent {
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

  /**
   * @param {number} dx
   * @param {number} dy
   */
  move(dx, dy) {
    this.x += dx;
    this.y += dy;
  }

  /**
   * Adds the specified x and y values to the current position.
   * @param {number} x
   * @param {number} y
   */
  add(x, y) {
    this.x += x;
    this.y += y;
  }

  /**
   * Subtracts the specified x and y values from the current position.
   * @param {number} x
   * @param {number} y
   */
  subtract(x, y) {
    this.x -= x;
    this.y -= y;
  }

  /**
   * Multiplies the current position by the specified factor.
   * @param {number} factor
   */
  multiply(factor) {
    this.x *= factor;
    this.y *= factor;
  }

  /**
   * Divides the current position by the specified divisor.
   * @param {number} divisor
   */
  divide(divisor) {
    this.x /= divisor;
    this.y /= divisor;
  }

  /**
   * Calculates the distance between the current position and another position.
   * @param {PositionComponent} otherPosition
   * @returns {number}
   */
  distanceTo(otherPosition) {
    const dx = this.x - otherPosition.x;
    const dy = this.y - otherPosition.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Calculates the angle (in radians) between the current position and another position.
   * @param {PositionComponent} otherPosition
   * @returns {number}
   */
  angleTo(otherPosition) {
    const dx = otherPosition.x - this.x;
    const dy = otherPosition.y - this.y;
    return Math.atan2(dy, dx);
  }

  /**
   * Sets the position component to a new position specified by an angle (in radians) and distance from the origin.
   * @param {number} angle - The angle in radians.
   * @param {number} distance - The distance from the origin.
   */
  setToPolar(angle, distance) {
    this.x = Math.cos(angle) * distance;
    this.y = Math.sin(angle) * distance;
  }

  /**
   * Linearly interpolates between the current position and another position by the specified amount t (a value between 0 and 1).
   * @param {PositionComponent} otherPosition
   * @param {number} t
   */
  lerp(otherPosition, t) {
    this.x = this.x + (otherPosition.x - this.x) * t;
    this.y = this.y + (otherPosition.y - this.y) * t;
  }

  /**
   * Normalizes the current position to a unit vector.
   */
  normalize() {
    const length = Math.sqrt(this.x * this.x + this.y * this.y);
    if (length > 0) this.divide(length);
  }

  /**
   * Returns a new position component with the same x and y values as the current position.
   * @returns {PositionComponent}
   */
  clone() {
    return new PositionComponent(this.x, this.y);
  }
}
