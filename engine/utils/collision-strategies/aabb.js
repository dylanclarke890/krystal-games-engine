/**
 * Aligned Axis Bounding Box check.
 * @param {import("../components/position.js").Position} posA
 * @param {import("../components/size.js").Size} sizeA
 * @param {import("../components/position.js").Position} posB
 * @param {import("../components/size.js").Size} sizeB
 * @returns {boolean}
 */
export function AABBCollisionCheck(posA, sizeA, posB, sizeB) {
  return (
    posA.x < posB.x + sizeB.x &&
    posA.x + sizeA.x > posB.x &&
    posA.y < posB.y + sizeB.y &&
    posA.y + sizeA.y > posB.y
  );
}
