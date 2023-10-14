import { CircleCollider } from "../components/collider.js";
import { Vector2 } from "../maths/vector2.js";

export function isPointWithinCircle(p: Vector2, circle: CircleCollider): boolean {
  return p.clone().sub(circle.getAbsolutePosition()).distanceSquared() < circle.radius * circle.radius;
}
