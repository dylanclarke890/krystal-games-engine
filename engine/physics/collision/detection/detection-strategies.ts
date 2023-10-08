import { Vector2 } from "../../../maths/vector2.js";

export function arePointsColliding(a: Vector2, b: Vector2) {
  return a.x === b.x && a.y === b.y;
}

export function isPointCollidingWithRect(point: Vector2, rectPos: Vector2, rectSize: Vector2): boolean {
  return (
    point.x >= rectPos.x && point.x < rectPos.x + rectSize.x && point.y >= rectPos.y && point.y < rectPos.y + rectSize.y
  );
}

export function areRectsColliding(
  rectPosA: Vector2,
  rectSizeA: Vector2,
  rectPosB: Vector2,
  rectSizeB: Vector2
): boolean {
  return (
    rectPosA.x < rectPosB.x + rectSizeB.x &&
    rectPosA.x + rectSizeA.x > rectPosB.x &&
    rectPosA.y < rectPosB.y + rectSizeB.y &&
    rectPosA.y + rectSizeA.y > rectPosB.y
  );
}
