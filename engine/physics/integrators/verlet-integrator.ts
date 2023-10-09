import { RigidBody } from "../../components/rigid-body.js";
import { VerletData } from "../../components/verlet-data.js";
import { SideOfCollision } from "../../constants/enums.js";
import { COLLISION_ADJUSTMENT_BUFFER } from "../../constants/global-constants.js";
import { ViewportCollisionEvent } from "../../types/common-types.js";
import { BaseIntegrator } from "./base-integrator.js";

export class VerletIntegrator extends BaseIntegrator {
  integrate(entityId: number, rigidBody: RigidBody, dt: number): void {
    let verletData = this.entityManager.getComponent<VerletData>(entityId, "verletData");
    const position = rigidBody.transform.position;

    if (typeof verletData === "undefined") {
      const velocity = this.vectorPool
        .acquire()
        .assign(rigidBody.velocity)
        .divScalar(1000 / this.frameRate);
      verletData = new VerletData(position.clone().sub(velocity));
      this.entityManager.addComponent(entityId, verletData);
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
    const { id, side, rigidBody, collider } = event;
    const verletData = this.entityManager.getComponent<VerletData>(id, "verletData");
    if (typeof verletData === "undefined") {
      return;
    }

    switch (side) {
      case SideOfCollision.Left:
        const overlapXLeft = collider.size.x / 2 + COLLISION_ADJUSTMENT_BUFFER - rigidBody.transform.position.x;
        rigidBody.transform.position.x += overlapXLeft;
        verletData.prevPosition.x += overlapXLeft;
        break;

      case SideOfCollision.Right:
        const overlapXRight =
          rigidBody.transform.position.x + collider.size.x / 2 - (this.viewport.width - COLLISION_ADJUSTMENT_BUFFER);
        rigidBody.transform.position.x -= overlapXRight;
        verletData.prevPosition.x -= overlapXRight;
        break;

      case SideOfCollision.Top:
        const overlapYTop = collider.size.y / 2 + COLLISION_ADJUSTMENT_BUFFER - rigidBody.transform.position.y;
        rigidBody.transform.position.y += overlapYTop;
        verletData.prevPosition.y += overlapYTop;
        break;

      case SideOfCollision.Bottom:
        const overlapYBottom =
          rigidBody.transform.position.y + collider.size.y / 2 - (this.viewport.height - COLLISION_ADJUSTMENT_BUFFER);
        rigidBody.transform.position.y -= overlapYBottom;
        verletData.prevPosition.y -= overlapYBottom;
        break;
    }
  }
}
