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
   * Calculates the squared distance between the current position and another position, which can be faster
   * than calculating the actual distance if you only need to compare distances.
   * @param {PositionComponent} otherPosition
   * @returns {number}
   */
  distanceToSquared(otherPosition) {
    const dx = this.x - otherPosition.x;
    const dy = this.y - otherPosition.y;
    return dx * dx + dy * dy;
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
   * Sets the position component to a new position specified by an angle (in radians) and distance from the origin.
   * @param {number} angle The angle in radians.
   * @param {number} distance The distance from the origin.
   */
  setToPolar(angle, distance) {
    this.x = Math.cos(angle) * distance;
    this.y = Math.sin(angle) * distance;
  }

  /**
   * @param {number} dx
   * @param {number} dy
   */
  move(dx, dy) {
    this.add(dx, dy);
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
   * Returns the dot product of the current position and the specified position.
   * @param {PositionComponent} otherPosition
   * @returns {number}
   */
  dot(otherPosition) {
    return this.x * otherPosition.x + this.y * otherPosition.y;
  }

  /**
   * Returns the cross product of the current position and the specified position.
   * @param {PositionComponent} otherPosition
   * @returns {number}
   */
  cross(otherPosition) {
    return this.x * otherPosition.y - this.y * otherPosition.x;
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
   * Calculates the angle (in radians) between the current position and another position, relative to the x-axis.
   * @param {PositionComponent} otherPosition
   * @returns {number}
   */
  angleBetween(otherPosition) {
    return Math.atan2(otherPosition.y - this.y, otherPosition.x - this.x);
  }

  /**
   * Rounds the current position's x and y values to the nearest integer.
   */
  round() {
    this.x = Math.round(this.x);
    this.y = Math.round(this.y);
  }

  /**
   * Rounds the current position's x and y values down to the nearest integer.
   */
  floor() {
    this.x = Math.floor(this.x);
    this.y = Math.floor(this.y);
  }

  /**
   * Rounds the current position's x and y values up to the nearest integer.
   */
  ceil() {
    this.x = Math.ceil(this.x);
    this.y = Math.ceil(this.y);
  }

  /**
   * Clamps the current position's x and y values to a specified range.
   * @param {number} minX
   * @param {number} minY
   * @param {number} maxX
   * @param {number} maxY
   */
  clamp(minX, minY, maxX, maxY) {
    this.x = Math.max(minX, Math.min(this.x, maxX));
    this.y = Math.max(minY, Math.min(this.y, maxY));
  }

  /**
   * Linearly interpolates between the current position and another position by the specified amount t
   * (a value between 0 and 1).
   * @param {PositionComponent} otherPosition
   * @param {number} t
   */
  lerp(otherPosition, t) {
    this.x = this.x + (otherPosition.x - this.x) * t;
    this.y = this.y + (otherPosition.y - this.y) * t;
  }

  /**
   * Sets the current position to a linear interpolation between two other positions, based on an alpha value
   * between 0 and 1.
   * @param {PositionComponent} vector1
   * @param {PositionComponent} vector2
   * @param {number} alpha
   */
  lerpVectors(vector1, vector2, alpha) {
    this.x = vector1.x + (vector2.x - vector1.x) * alpha;
    this.y = vector1.y + (vector2.y - vector1.y) * alpha;
  }

  /**
   * Normalizes the current position to a unit vector.
   */
  normalize() {
    const length = Math.sqrt(this.x * this.x + this.y * this.y);
    if (length > 0) this.divide(length);
  }

  /**
   * Returns true if the current position is equal to another position component.
   * @param {PositionComponent} otherPosition
   * @returns {boolean}
   */
  equals(otherPosition) {
    return this.x === otherPosition.x && this.y === otherPosition.y;
  }

  /**
   * Returns a new position component with the same x and y values as the current position.
   * @returns {PositionComponent}
   */
  clone() {
    return new PositionComponent(this.x, this.y);
  }
}
