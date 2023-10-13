export class Vector2 {
  y: number;
  x: number;

  static zero = Object.freeze(new Vector2(0, 0)) as Vector2;

  constructor(x?: number, y?: number) {
    this.x = x ?? 0;
    this.y = y ?? 0;
  }

  set(x: number, y: number) {
    this.x = x;
    this.y = y;
    return this;
  }

  assign(other: Vector2) {
    this.x = other.x;
    this.y = other.y;
    return this;
  }

  add(other: Vector2) {
    this.x += other.x;
    this.y += other.y;
    return this;
  }

  addScalar(value: number) {
    this.x += value;
    this.y += value;
    return this;
  }

  sub(other: Vector2) {
    this.x -= other.x;
    this.y -= other.y;
    return this;
  }

  subScalar(value: number) {
    this.x -= value;
    this.y -= value;
    return this;
  }

  mul(other: Vector2) {
    this.x *= other.x;
    this.y *= other.y;
    return this;
  }

  mulScalar(value: number) {
    this.x *= value;
    this.y *= value;
    return this;
  }

  div(other: Vector2) {
    if (other.x !== 0) {
      this.x /= other.x;
    }

    if (other.y !== 0) {
      this.y /= other.y;
    }

    return this;
  }

  divScalar(value: number) {
    if (value !== 0) {
      this.x /= value;
      this.y /= value;
    }

    return this;
  }

  negate() {
    this.x = -this.x;
    this.y = -this.y;
    return this;
  }

  clone() {
    return new Vector2(this.x, this.y);
  }

  normalize() {
    return this.divScalar(this.magnitude());
  }

  distanceSquared() {
    return this.x * this.x + this.y * this.y;
  }

  magnitude() {
    return Math.sqrt(this.distanceSquared());
  }
}
