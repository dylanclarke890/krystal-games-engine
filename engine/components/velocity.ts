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

  add(x: number, y: number): this {
    this.x += x;
    this.y += y;
    return this;
  }

  sub(x: number, y: number): this {
    this.x -= x;
    this.y -= y;
    return this;
  }

  set(x: number, y: number): this {
    this.x = x;
    this.y = y;
    return this;
  }

  /** Dot product. */
  dot(otherVelocity: Velocity): number {
    return this.x * otherVelocity.x + this.y * otherVelocity.y;
  }
}
