export function pointVsPoint(a: Vector, b: Vector) {
  return a.x === b.x && a.y === b.y;
}

export function pointVsRect(point: Vector, rectPos: Vector, rectSize: Vector): boolean {
  return (
    point.x >= rectPos.x && point.x < rectPos.x + rectSize.x && point.y >= rectPos.y && point.y < rectPos.y + rectSize.y
  );
}

export function rectVsRect(rectPosA: Vector, rectSizeA: Vector, rectPosB: Vector, rectSizeB: Vector): boolean {
  return (
    rectPosA.x < rectPosB.x + rectSizeB.x &&
    rectPosA.x + rectSizeA.x > rectPosB.x &&
    rectPosA.y < rectPosB.y + rectSizeB.y &&
    rectPosA.y + rectSizeA.y > rectPosB.y
  );
}
