import { RigidBody } from "../../components/rigid-body.js";
import { Vector2 } from "../../maths/vector2.js";
import { IObjectPool, IObjectPoolManager } from "../../types/common-interfaces.js";

export abstract class BaseIntegrator {
  /** Object pool for vectors used during calculations. */
  vectorPool: IObjectPool<Vector2>;
  /** Accumulates vectors used during calculations so that they get released at once. */
  pooledVectors: Vector2[];
  epsilon = 1e-5;

  constructor(objectPoolManager: IObjectPoolManager) {
    this.vectorPool = objectPoolManager.create("vector2", Vector2, (vec, x, y) => vec.set(x ?? 0, y ?? 0));
    this.pooledVectors = [];
  }

  abstract integrate(rigidBody: RigidBody, dt: number): void;

  releasePooledVectors() {
    this.pooledVectors.forEach(this.vectorPool.release, this.vectorPool);
    this.pooledVectors.length = 0;
  }
}
