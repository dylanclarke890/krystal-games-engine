import { Vector2D } from "../../utils/maths/vector-2d.js";
import { BaseComponent } from "../base.js";
import { Animation, Shape, Sprite } from "./index.js";

export abstract class Renderable extends BaseComponent {
  type: string = "renderable";

  position: Vector2D;
  sprite?: Sprite;
  animation?: Animation;
  shape?: Shape;

  constructor(position: Vector2D) {
    super();
    this.position = position;
  }
}

export class RenderableSprite extends Renderable {
  constructor(position: Vector2D, sprite: Sprite, animation?: Animation) {
    super(position);
    this.sprite = sprite;
    this.animation = animation;
  }
}

export class RenderableShape extends Renderable {
  constructor(position: Vector2D, shape: Shape) {
    super(position);
    this.shape = shape;
  }
}
