import { Vector2 } from "../maths/vector2.js";
import { BaseComponent } from "./base.js";

export class VerletData extends BaseComponent {
  type: string = "verletData";
  prevPosition: Vector2;

  constructor(prevPosition = new Vector2()) {
    super();
    this.prevPosition = prevPosition;
  }
}
