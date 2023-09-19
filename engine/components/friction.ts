import { Vector2D } from "../utils/vector-2d.js";

export class Friction extends Vector2D {
  constructor(x?: number, y?: number) {
    super(x ?? 1, y ?? 1, 0, 1, 0, 1);
  }
}
