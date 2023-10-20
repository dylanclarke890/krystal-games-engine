import { Vector2 } from "../maths/vector2.js";
import { BaseComponent } from "./index.js";

export class Transform extends BaseComponent {
  name = "transform";

  position: Vector2;
  prevPosition: Vector2;
  rotation: number;
  scale: Vector2;

  constructor() {
    super();
    this.position = new Vector2(0, 0);
    this.prevPosition = new Vector2(0, 0);
    this.rotation = 0;
    this.scale = new Vector2(1, 1);
  }
}
