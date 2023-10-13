import { CircleCollider, RectCollider } from "../../../components/collider.js";
import { ShapeType } from "../../../constants/enums.js";
import { constrain } from "../../../maths/number.js";
import { Vector2 } from "../../../maths/vector2.js";
import { ColliderEntity, CollisionInfo } from "../data.js";

export function checkRectsCollision(a: ColliderEntity, b: ColliderEntity): Nullable<CollisionInfo> {
  const aCollider = a.collider as RectCollider;
  const bCollider = b.collider as RectCollider;

  const aPosition = aCollider.getAbsolutePosition();
  const bPosition = bCollider.getAbsolutePosition();

  if (
    !(
      aPosition.x < bPosition.x + bCollider.size.x &&
      aPosition.x + aCollider.size.x > bPosition.x &&
      aPosition.y < bPosition.y + bCollider.size.y &&
      aPosition.y + aCollider.size.y > bPosition.y
    )
  ) {
    return undefined;
  }

  const info = new CollisionInfo(a, b);

  // Calculate half sizes
  const halfWidthA = aCollider.size.x / 2;
  const halfHeightA = aCollider.size.y / 2;
  const halfWidthB = bCollider.size.x / 2;
  const halfHeightB = bCollider.size.y / 2;

  const dx = bPosition.x + halfWidthB - (aPosition.x + halfWidthA);
  const dy = bPosition.y + halfHeightB - (aPosition.y + halfHeightA);

  const overlapX = halfWidthA + halfWidthB - Math.abs(dx);
  const overlapY = halfHeightA + halfHeightB - Math.abs(dy);

  if (overlapX < overlapY) {
    info.penetration = overlapX;
    info.normal.x = dx < 0 ? -1 : 1;
  } else {
    info.penetration = overlapY;
    info.normal.y = dy < 0 ? -1 : 1;
  }

  info.contactPoints.push(new Vector2(aPosition.x + halfWidthA - dx / 2, aPosition.y + halfHeightA - dy / 2));

  return info;
}

export function checkCirclesCollision(a: ColliderEntity, b: ColliderEntity): Nullable<CollisionInfo> {
  const aCollider = a.collider as CircleCollider;
  const bCollider = b.collider as CircleCollider;

  const aPosition = a.collider.getAbsolutePosition();
  const delta = b.collider.getAbsolutePosition().sub(aPosition);
  // Distance from the center of a to the center of b.
  const distance = delta.magnitude();

  if (distance > aCollider.radius + bCollider.radius) {
    return undefined;
  }

  const info = new CollisionInfo(a, b);
  // Size of the overlap
  info.penetration = aCollider.radius + bCollider.radius - distance;

  // Normalized vector pointing from the center of a to the center of b.
  const normal = delta.normalize();
  info.normal = normal;

  // Find the point on the edge of circle A that is closest to circle B, based on their radii.
  const contactPoint = aPosition.add(normal.mulScalar(aCollider.radius - info.penetration / 2));
  info.contactPoints.push(contactPoint);

  return info;
}

export function checkCircleRectCollision(a: ColliderEntity, b: ColliderEntity): Nullable<CollisionInfo> {
  const circleEntity = a.collider.shapeType === ShapeType.Circle ? a : b;
  const rectEntity = a === circleEntity ? b : a;

  const circle = circleEntity.collider as CircleCollider;
  const rect = rectEntity.collider as RectCollider;

  const circlePos = circle.getAbsolutePosition();
  const closestPoint = new Vector2(
    constrain(circlePos.x, rect.aabb.minX, rect.aabb.maxX),
    constrain(circlePos.y, rect.aabb.minY, rect.aabb.maxY)
  );

  const delta = circlePos.sub(closestPoint);
  const distanceSquared = delta.distanceSquared();
  if (distanceSquared > circle.radius * circle.radius) {
    return undefined;
  }

  const info = new CollisionInfo(circleEntity, rectEntity);
  const distance = Math.sqrt(distanceSquared);

  info.penetration = circle.radius - distance;
  info.normal = delta.normalize();

  // The contact point would be the point on the circle that's closest to the rectangle
  const contactPoint = circlePos.sub(info.normal.mulScalar(circle.radius));
  info.contactPoints.push(contactPoint);

  return info;
}

// TODO:
// export function checkPolygonsCollision(a: PolygonCollider, b: PolygonCollider, info: CollisionInfo): void {}
// export function checkPolygonRectCollision(a: PolygonCollider, b: RectCollider, info: CollisionInfo): void {}
// export function checkPolygonCircleCollision(a: PolygonCollider, b: CircleCollider, info: CollisionInfo): void {}
