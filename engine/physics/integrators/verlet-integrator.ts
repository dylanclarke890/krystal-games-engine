import { RigidBody } from "../../components/rigid-body.js";
import { VerletData } from "../../components/verlet-data.js";
import { SideOfCollision } from "../../constants/enums.js";
import { ViewportCollisionEvent } from "../../types/common-types.js";
import { BaseIntegrator } from "./base-integrator.js";

export class VerletIntegrator extends BaseIntegrator {
  integrate(entityId: number, rigidBody: RigidBody, dt: number): void {
    let verletData = this.context.entities.getComponent<VerletData>(entityId, "verletData");
    const position = rigidBody.transform.position;

    if (typeof verletData === "undefined") {
      const velocity = this.vectorPool
        .acquire()
        .assign(rigidBody.velocity)
        .divScalar(1000 / this.frameRate);
      verletData = new VerletData(position.clone().sub(velocity));
      this.context.entities.addComponent(entityId, verletData);
      this.pooledVectors.push(velocity);
    }

    const savedPosition = this.vectorPool.acquire().assign(position);
    const prevPosition = verletData.prevPosition;

    this.pooledVectors.push(savedPosition);

    const dtSquared = dt * dt;
    position.x = 2 * position.x - prevPosition.x + rigidBody.force.x * dtSquared;
    position.y = 2 * position.y - prevPosition.y + rigidBody.force.y * dtSquared;

    this.pooledVectors.push(rigidBody.velocity);
    prevPosition.assign(savedPosition);
    rigidBody.velocity = this.vectorPool.acquire().assign(position).sub(prevPosition).divScalar(dt);

    this.releasePooledVectors();
  }

  bounceOffViewportBoundaries(event: ViewportCollisionEvent): void {
    const { id, sides, rigidBody, collider } = event;
    const viewport = this.context.viewport;
    const verletData = this.context.entities.getComponent<VerletData>(id, "verletData");
    if (typeof verletData === "undefined") {
      return;
    }

    if (sides.has(SideOfCollision.LEFT)) {
      const overlapXLeft = collider.size.x / 2 + this.adjustmentBuffer - rigidBody.transform.position.x;
      rigidBody.transform.position.x += overlapXLeft;
      verletData.prevPosition.x += overlapXLeft;
    }

    if (sides.has(SideOfCollision.RIGHT)) {
      const overlapXRight =
        rigidBody.transform.position.x + collider.size.x / 2 - (viewport.width - this.adjustmentBuffer);
      rigidBody.transform.position.x -= overlapXRight;
      verletData.prevPosition.x -= overlapXRight;
    }

    if (sides.has(SideOfCollision.TOP)) {
      const overlapYTop = collider.size.y / 2 + this.adjustmentBuffer - rigidBody.transform.position.y;
      rigidBody.transform.position.y += overlapYTop;
      verletData.prevPosition.y += overlapYTop;
    }

    if (sides.has(SideOfCollision.BOTTOM)) {
      const overlapYBottom =
        rigidBody.transform.position.y + collider.size.y / 2 - (viewport.height - this.adjustmentBuffer);
      rigidBody.transform.position.y -= overlapYBottom;
      verletData.prevPosition.y -= overlapYBottom;
    }
  }
}
