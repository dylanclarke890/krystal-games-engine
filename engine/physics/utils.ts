import { CircleCollider, RectCollider } from "../components/collider.js";
import { Vector2 } from "../maths/vector2.js";

export function isPointWithinCircle(p: Vector2, circle: CircleCollider): boolean {
  return p.clone().sub(circle.getAbsolutePosition()).distanceSquared() < circle.radius * circle.radius;
}

export function isPointWithinRect(p: Vector2, rect: RectCollider): boolean {
  return p.x >= rect.aabb.minX && p.x <= rect.aabb.maxX && p.y >= rect.aabb.minY && p.y <= rect.aabb.maxY;
}
