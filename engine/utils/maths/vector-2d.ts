import { constrain, randomInt } from "./number.js";
import { parseJSON } from "../string.js";

export class Vector2D {
  x: number;
  y: number;
  xMin?: number;
  xMax?: number;
  yMin?: number;
  yMax?: number;

  constructor(x?: number, y?: number, xMin?: number, xMax?: number, yMin?: number, yMax?: number) {
    this.x = x ?? 0;
    this.y = y ?? 0;
    this.xMin = xMin;
    this.xMax = xMax;
    this.yMin = yMin;
    this.yMax = yMax;
    this.#constrain();
  }

  add(other: Vector2D | number) {
    if (typeof other === "number") {
      this.x += other;
      this.y += other;
    } else {
      this.x += other.x;
      this.y += other.y;
    }

    this.#constrain();
    return this;
  }

  sub(other: Vector2D | number) {
    if (typeof other === "number") {
      this.x -= other;
      this.y -= other;
    } else {
      this.x -= other.x;
      this.y -= other.y;
    }

    this.#constrain();
    return this;
  }

  div(other: Vector2D | number) {
    if (typeof other === "number") {
      if (other !== 0) {
        this.x /= other;
        this.y /= other;
      }
    } else {
      if (other.x !== 0) {
        this.x /= other.x;
      }

      if (other.y !== 0) {
        this.y /= other.y;
      }
    }

    this.#constrain();
    return this;
  }

  mul(other: Vector2D | number) {
    if (typeof other === "number") {
      this.x *= other;
      this.y *= other;
    } else {
      this.x *= other.x;
      this.y *= other.y;
    }
    this.#constrain();
    return this;
  }

  /**
   * Linearly interpolates between the vectors based on an alpha value between 0 and 1.
   */
  lerp(other: Vector2D, alpha: number) {
    alpha = constrain(alpha, 0, 1);
    this.x = this.x + (other.x - this.x) * alpha;
    this.y = this.y + (other.y - this.y) * alpha;
    this.#constrain();
    return this;
  }

  /**
   * Sets the current position to a linear interpolation between two other vectors, based on an alpha value
   * between 0 and 1.
   */
  lerpVectors(a: Vector2D, b: Vector2D, alpha: number) {
    alpha = constrain(alpha, 0, 1);
    this.x = a.x + (b.x - a.x) * alpha;
    this.y = a.y + (b.y - a.y) * alpha;
    this.#constrain();
    return this;
  }

  /** Sets this vector based on an angle in radians and distance from the origin. */
  setToPolar(angle: number, distance: number) {
    this.x = Math.cos(angle) * distance;
    this.y = Math.sin(angle) * distance;
    this.#constrain();
    return this;
  }

  assign(other: Vector2D) {
    this.x = other.x;
    this.y = other.y;
    this.xMin = other.xMin;
    this.xMax = other.xMax;
    this.yMin = other.yMin;
    this.yMax = other.yMax;
    return this;
  }

  floor() {
    this.x = Math.floor(this.x);
    this.y = Math.floor(this.y);
    return this;
  }

  round() {
    this.x = Math.round(this.x);
    this.y = Math.round(this.y);
    return this;
  }

  ceil() {
    this.x = Math.ceil(this.x);
    this.y = Math.ceil(this.y);
    return this;
  }

  /** Randomizes x and y to be between their min and max if set. */
  randomize(xMin = this.xMin, xMax = this.xMax, yMin = this.yMin, yMax = this.yMax) {
    let randomised = false;

    if (typeof xMin === "number" && typeof xMax === "number") {
      this.x = randomInt(xMin, xMax);
      randomised = true;
    }

    if (typeof yMin === "number" && typeof yMax === "number") {
      this.y = randomInt(yMin, yMax);
      randomised = true;
    }

    if (randomised) {
      this.#constrain();
    }

    return this;
  }

  /** @returns the dot product. */
  dot(other: Vector2D): number {
    return this.x * other.x + this.y * other.y;
  }

  /** @returns the cross product. */
  cross(other: Vector2D): number {
    return this.x * other.y - this.y * other.x;
  }

  /** @returns the angle in radians between the vectors, relative to the x-axis. */
  angleTo(other: Vector2D): number {
    return Math.atan2(other.y - this.y, other.x - this.x);
  }

  distanceTo(other: Vector2D): number {
    return Math.sqrt(this.distanceToSquared(other));
  }

  /**
   * Calculates the squared distance between the current position and another position, which is faster
   * than calculating the actual distance if you only need to compare distances.
   */
  distanceToSquared(other: Vector2D): number {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    return dx * dx + dy * dy;
  }

  /** @returns a clone of the current instance. */
  clone(): Vector2D {
    return new Vector2D(this.x, this.y, this.xMin, this.xMax, this.yMin, this.yMax);
  }

  serialize(): string {
    return JSON.stringify(this);
  }

  deserialize(data: string): void {
    const parsed = parseJSON<Vector2D>(data);
    this.assign(parsed);
    this.#constrain();
  }

  #constrain() {
    if (typeof this.xMin === "number" && this.xMin > this.x) {
      this.x = this.xMin;
    }

    if (typeof this.xMax === "number" && this.xMax < this.x) {
      this.x = this.xMax;
    }

    if (typeof this.yMin === "number" && this.yMin > this.y) {
      this.y = this.yMin;
    }

    if (typeof this.yMax === "number" && this.yMax < this.y) {
      this.y = this.yMax;
    }
  }
}
