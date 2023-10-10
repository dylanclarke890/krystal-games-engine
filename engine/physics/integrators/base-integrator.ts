import { RigidBody } from "../../components/rigid-body.js";
import { GameEvents } from "../../constants/enums.js";
import { GameContext } from "../../core/context.js";
import { Vector2 } from "../../maths/vector2.js";
import { IObjectPool } from "../../types/common-interfaces.js";
import { ViewportCollisionEvent } from "../../types/events.js";

export abstract class BaseIntegrator {
  /** Object pool for vectors used during calculations. */
  vectorPool: IObjectPool<Vector2>;
  /** Accumulates vectors used during calculations so that they get released at once. */
  pooledVectors: Vector2[];
  /** Velocity magnitudes within this range are set to zero to prevent jittering. */
  velocityEpsilon = 1e-5;
  /** Resolved collisions adjust positions by this amount to prevent erroneous detections the following frame. */
  adjustmentBuffer: number;
  context: GameContext;

  constructor(context: GameContext) {
    this.context = context;
    this.vectorPool = context.objectPools.create("vector2", Vector2, (vec, x, y) => vec.set(x ?? 0, y ?? 0));
    this.context.events.on(GameEvents.VIEWPORT_COLLISION, this.bounceOffViewportBoundaries.bind(this));
    this.adjustmentBuffer = context.config.getInt("collisionAdjustmentBuffer") ?? 0.1;
    this.pooledVectors = [];
  }

  abstract integrate(entityId: number, rigidBody: RigidBody, dt: number): void;

  abstract bounceOffViewportBoundaries(event: ViewportCollisionEvent): void;

  releasePooledVectors() {
    this.pooledVectors.forEach(this.vectorPool.release, this.vectorPool);
    this.pooledVectors.length = 0;
  }
}
