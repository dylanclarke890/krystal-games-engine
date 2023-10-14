import { CollisionInfo } from "../data.js";

export function resolveCircleCircleCollision(info: CollisionInfo): void {
  const a = info.entityA;
  const b = info.entityB;
  const overlap = info.normal.clone().mulScalar(info.penetration);

  // Current
  const aPosition = a.collider.getAbsolutePosition();
  aPosition.sub(overlap);
  a.collider.setAbsolutePosition(aPosition);

  // Target
  const bPosition = b.collider.getAbsolutePosition();
  bPosition.add(overlap);
  b.collider.setAbsolutePosition(bPosition);
}
