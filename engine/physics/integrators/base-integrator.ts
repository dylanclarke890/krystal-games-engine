import { RigidBody } from "../../components/rigid-body.js";
import { GameContext } from "../../core/context.js";
import { Vector2 } from "../../maths/vector2.js";
import { IObjectPool } from "../../types/common-interfaces.js";
import { ViewportCollisionEvent } from "../../types/common-types.js";

export abstract class BaseIntegrator {
  /** Object pool for vectors used during calculations. */
  vectorPool: IObjectPool<Vector2>;
  /** Accumulates vectors used during calculations so that they get released at once. */
  pooledVectors: Vector2[];
  epsilon = 1e-5;
  context: GameContext;
  frameRate: number;

  constructor(context: GameContext, frameRate: number) {
    this.context = context;
    this.vectorPool = context.objectPools.create("vector2", Vector2, (vec, x, y) => vec.set(x ?? 0, y ?? 0));
    this.frameRate = frameRate;
    this.pooledVectors = [];
  }

  abstract integrate(entityId: number, rigidBody: RigidBody, dt: number): void;

  abstract bounceOffViewportBoundaries(event: ViewportCollisionEvent): void;

  releasePooledVectors() {
    this.pooledVectors.forEach(this.vectorPool.release, this.vectorPool);
    this.pooledVectors.length = 0;
  }
}
