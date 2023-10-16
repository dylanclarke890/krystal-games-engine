import { Vector2 } from "../../../maths/vector2.js";
import { CollisionInfo } from "../data.js";

export class ResolutionStrategies {
  static resolveCircles(info: CollisionInfo): void {
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

    if (typeof a.collider.rigidBody === "undefined" || typeof b.collider.rigidBody === "undefined") {
      return;
    }

    const tangent = new Vector2(-info.normal.y, info.normal.x);
    const aMass = a.collider.rigidBody.mass;
    const bMass = b.collider.rigidBody.mass;
    const aVelocity = a.collider.rigidBody.velocity;
    const bVelocity = b.collider.rigidBody.velocity;

    // Dot Product Tangent
    const aDotTan = aVelocity.clone().dot(tangent);
    const bDotTan = bVelocity.clone().dot(tangent);

    // Dot Product Normal
    const aDotNormal = aVelocity.clone().dot(info.normal);
    const bDotNormal = bVelocity.clone().dot(info.normal);

    // Conservation of momentum in 1D
    const aMomentum = (aDotNormal * (aMass - bMass) + 2 * bMass * bDotNormal) / (aMass + bMass);
    const bMomentum = (bDotNormal * (bMass - aMass) + 2 * aMass * aDotNormal) / (aMass + bMass);

    // Update ball velocities
    aVelocity.x = tangent.x * aDotTan + info.normal.x * aMomentum;
    aVelocity.y = tangent.y * aDotTan + info.normal.y * aMomentum;
    bVelocity.x = tangent.x * bDotTan + info.normal.x * bMomentum;
    bVelocity.y = tangent.y * bDotTan + info.normal.y * bMomentum;
  }
}
