import { Vector2 } from "./vector2.js";

export class AABB {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;

  constructor() {
    this.minX = 0;
    this.minY = 0;
    this.maxX = 0;
    this.maxY = 0;
  }

  intersects(aabb: AABB): boolean {
    return this.minX <= aabb.maxX && this.maxX >= aabb.minX && this.minY <= aabb.maxY && this.maxY >= aabb.minY;
  }

  isInside(aabb: AABB): boolean {
    return this.minX >= aabb.minX && this.maxX <= aabb.maxX && this.minY >= aabb.minY && this.maxY <= aabb.maxY;
  }

  contains(point: Vector2): boolean {
    return point.x >= this.minX && point.x <= this.maxX && point.y >= this.minY && point.y <= this.maxY;
  }
}
