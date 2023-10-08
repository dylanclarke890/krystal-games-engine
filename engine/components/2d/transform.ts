import { Vector2D } from "../../maths/vector-2d.js";
import { BaseComponent } from "../base.js";

export class Transform extends BaseComponent {
  type: string = "transform";

  position: Vector2D;
  rotation: number;
  scale: Vector2D;

  constructor() {
    super();
    this.position = new Vector2D(0, 0);
    this.rotation = 0;
    this.scale = new Vector2D(1, 1);
  }
}
