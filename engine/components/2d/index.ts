import { ScalarValue } from "../../utils/maths/scalar-value.js";
import { Vector2D } from "../../utils/maths/vector-2d.js";

export { AI } from "./ai.js";
export { Animation } from "./animation.js";
export { Input } from "./input.js";
export { Collision } from "./collision.js";
export { Shape } from "./shape.js";
export { Sprite } from "./sprite.js";

export class Acceleration extends Vector2D {}
export class Bounciness extends ScalarValue {
  constructor(value: number) {
    super(value, 0, 1);
  }
}
export class Damage extends ScalarValue {
  constructor(value: number) {
    super(value);
  }
}
export class Friction extends Vector2D {
  constructor(x?: number, y?: number) {
    super(x ?? 1, y ?? 1, 0, 1, 0, 1);
  }
}
export class GravityFactor extends Acceleration {
  constructor(x?: number, y?: number, xMin?: number, yMin?: number, xMax?: number, yMax?: number) {
    super(x, y ?? 9.81, xMin, xMax, yMin, yMax);
  }
}
export class Health extends ScalarValue {
  constructor(value?: number, max?: number) {
    super(value, 0, max);
  }
}
export class Offset extends Vector2D {}
export class Position extends Vector2D {}
export class Mass extends ScalarValue {
  constructor(value?: number, max?: number) {
    super(value ?? 1, 0, max);
  }
}
export class Size extends Vector2D {}
export class Velocity extends Vector2D {}
