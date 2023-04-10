export class Velocity {
  x: number;
  y: number;
  maxX?: number;
  maxY?: number;

  constructor(x: number, y: number, maxX?: number, maxY?: number) {
    this.x = x || 0;
    this.y = y || 0;
    this.maxX = maxX;
    this.maxY = maxY;
  }

  /**
   * Adds the specified x and y values to the current velocity.
   */
  add(x: number, y: number): this {
    this.x += x;
    this.y += y;
    return this;
  }

  set(x: number, y: number): this {
    this.x = x;
    this.y = y;
    return this;
  }

  /**
   * Returns the dot product of the current velocity and the specified velocity.
   * @param {Velocity} otherVelocity
   */
  dot(otherVelocity: Velocity): number {
    return this.x * otherVelocity.x + this.y * otherVelocity.y;
  }
}
