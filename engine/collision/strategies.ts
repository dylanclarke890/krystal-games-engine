import { Position, Size } from "../components/index.js";

/** Aligned Axis Bounding Box check */
export function AABBCollision(posA: Position, sizeA: Size, posB: Position, sizeB: Size): boolean {
  return (
    posA.x < posB.x + sizeB.x && posA.x + sizeA.x > posB.x && posA.y < posB.y + sizeB.y && posA.y + sizeA.y > posB.y
  );
}
