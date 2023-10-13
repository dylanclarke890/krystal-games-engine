import { RigidBody } from "../../components/rigid-body.js";
import { GameContext } from "../../core/context.js";
import { Vector2 } from "../../maths/vector2.js";
import { IObjectPool } from "../../types/common-interfaces.js";

export abstract class BaseIntegrator {
  /** Object pool for vectors used during calculations. */
  vectorPool: IObjectPool<typeof Vector2>;
  /** Accumulates vectors used during calculations so that they get released at once. */
  pooledVectors: Vector2[];
  /** Velocity magnitudes within this range are set to zero to prevent jittering. */
  velocityEpsilon = 1e-5;
  context: GameContext;

  constructor(context: GameContext) {
    this.context = context;
    this.vectorPool = context.objectPools.create("vector2", { ClassConstructor: Vector2, initialReserveSize: 100 });
    this.pooledVectors = [];
  }

  abstract integrate(entityId: number, rigidBody: RigidBody, dt: number): void;

  releasePooledVectors() {
    this.pooledVectors.forEach(this.vectorPool.release, this.vectorPool);
    this.pooledVectors.length = 0;
  }
}
