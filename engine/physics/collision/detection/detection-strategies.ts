import { Vector2D } from "../../../utils/maths/vector-2d.js";

export function pointVsPoint(a: Vector2D, b: Vector2D) {
  return a.x === b.x && a.y === b.y;
}

export function pointVsRect(point: Vector2D, rectPos: Vector2D, rectSize: Vector2D): boolean {
  return (
    point.x >= rectPos.x && point.x < rectPos.x + rectSize.x && point.y >= rectPos.y && point.y < rectPos.y + rectSize.y
  );
}

export function rectVsRect(rectPosA: Vector2D, rectSizeA: Vector2D, rectPosB: Vector2D, rectSizeB: Vector2D): boolean {
  return (
    rectPosA.x < rectPosB.x + rectSizeB.x &&
    rectPosA.x + rectSizeA.x > rectPosB.x &&
    rectPosA.y < rectPosB.y + rectSizeB.y &&
    rectPosA.y + rectSizeA.y > rectPosB.y
  );
}
