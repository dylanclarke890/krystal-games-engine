import { Vector2 } from "../../maths/vector-2d.js";
import { BaseComponent } from "../base.js";

export class Transform extends BaseComponent {
  type: string = "transform";

  position: Vector2;
  rotation: number;
  scale: Vector2;

  constructor() {
    super();
    this.position = new Vector2(0, 0);
    this.rotation = 0;
    this.scale = new Vector2(1, 1);
  }
}
