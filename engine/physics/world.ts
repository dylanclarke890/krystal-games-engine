import { Vector2 } from "../maths/vector2.js";
import { BaseIntegrator } from "./integrators/base-integrator.js";

export class World {
  gravity: Vector2;
  integrator: BaseIntegrator;
  constructor(integrator: BaseIntegrator, gravity?: Vector2) {
    this.gravity = gravity ?? new Vector2(0, 9.8);
    this.integrator = integrator;
  }
}
