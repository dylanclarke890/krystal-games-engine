import { Vector2 } from "../maths/vector2.js";

export class World {
  gravity: Vector2;

  constructor(gravity?: Vector2) {
    this.gravity = gravity ?? new Vector2(0, 9.8);
  }
}
