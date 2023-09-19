export class Position {
  x: number;
  y: number;

  constructor(x?: number, y?: number) {
    this.x = x || 0;
    this.y = y || 0;
  }

  /**
   * Calculates the distance between the current position and another position.
   */
  distanceTo(otherPosition: Position): number {
    const dx = this.x - otherPosition.x;
    const dy = this.y - otherPosition.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Calculates the squared distance between the current position and another position, which can be faster
   * than calculating the actual distance if you only need to compare distances.
   */
  distanceToSquared(otherPosition: Position): number {
    const dx = this.x - otherPosition.x;
    const dy = this.y - otherPosition.y;
    return dx * dx + dy * dy;
  }

  set(x?: number, y?: number): this {
    this.x = x ?? this.x;
    this.y = y ?? this.x;
    return this;
  }

  /**
   * Sets the position component to a new position specified by an angle (in radians) and distance from the origin.
   * @param {number} angle The angle in radians.
   * @param {number} distance The distance from the origin.
   */
  setToPolar(angle: number, distance: number): this {
    this.x = Math.cos(angle) * distance;
    this.y = Math.sin(angle) * distance;
    return this;
  }

  move(dx: number, dy: number): this {
    return this.add(dx, dy);
  }

  /**
   * Adds the specified x and y values to the current position.
   */
  add(x: number, y: number): this {
    this.x += x;
    this.y += y;
    return this;
  }

  /**
   * Subtracts the specified x and y values from the current position.
   */
  subtract(x: number, y: number): this {
    this.x -= x;
    this.y -= y;
    return this;
  }

  /**
   * Multiplies the current position by the specified factor.
   */
  multiply(factor: number): this {
    this.x *= factor;
    this.y *= factor;
    return this;
  }

  /**
   * Divides the current position by the specified divisor.
   */
  divide(divisor: number): this {
    this.x /= divisor;
    this.y /= divisor;
    return this;
  }

  /**
   * Returns the dot product of the current position and the specified position.
   */
  dot(otherPosition: Position): number {
    return this.x * otherPosition.x + this.y * otherPosition.y;
  }

  /**
   * Returns the cross product of the current position and the specified position.
   */
  cross(otherPosition: Position): number {
    return this.x * otherPosition.y - this.y * otherPosition.x;
  }

  /**
   * Calculates the angle (in radians) between the current position and another position.
   */
  angleTo(otherPosition: Position): number {
    const dx = otherPosition.x - this.x;
    const dy = otherPosition.y - this.y;
    return Math.atan2(dy, dx);
  }

  /**
   * Calculates the angle (in radians) between the current position and another position, relative to the x-axis.
   */
  angleBetween(otherPosition: Position): number {
    return Math.atan2(otherPosition.y - this.y, otherPosition.x - this.x);
  }

  /**
   * Rounds the current position's x and y values to the nearest integer.
   */
  round(): this {
    this.x = Math.round(this.x);
    this.y = Math.round(this.y);
    return this;
  }

  /**
   * Rounds the current position's x and y values down to the nearest integer.
   */
  floor(): this {
    this.x = Math.floor(this.x);
    this.y = Math.floor(this.y);
    return this;
  }

  /**
   * Rounds the current position's x and y values up to the nearest integer.
   */
  ceil(): this {
    this.x = Math.ceil(this.x);
    this.y = Math.ceil(this.y);
    return this;
  }

  /**
   * Clamps the current position's x and y values to a specified range.
   */
  clamp(minX: number, minY: number, maxX: number, maxY: number): this {
    this.x = Math.max(minX, Math.min(this.x, maxX));
    this.y = Math.max(minY, Math.min(this.y, maxY));
    return this;
  }

  /**
   * Linearly interpolates between the current position and another position by the specified amount t
   * (a value between 0 and 1).
   */
  lerp(otherPosition: Position, t: number): this {
    this.x = this.x + (otherPosition.x - this.x) * t;
    this.y = this.y + (otherPosition.y - this.y) * t;
    return this;
  }

  /**
   * Sets the current position to a linear interpolation between two other positions, based on an alpha value
   * between 0 and 1.
   */
  lerpVectors(vector1: Position, vector2: Position, alpha: number): this {
    this.x = vector1.x + (vector2.x - vector1.x) * alpha;
    this.y = vector1.y + (vector2.y - vector1.y) * alpha;
    return this;
  }

  /**
   * Normalizes the current position to a unit vector.
   */
  normalize(): this {
    const length = Math.sqrt(this.x * this.x + this.y * this.y);
    if (length > 0) this.divide(length);
    return this;
  }

  /**
   * Returns true if the current position is equal to another position component.
   */
  equals(otherPosition: Position): boolean {
    return this.x === otherPosition.x && this.y === otherPosition.y;
  }

  /**
   * Returns a new position component with the same x and y values as the current position.
   */
  clone(): Position {
    return new Position(this.x, this.y);
  }
}
