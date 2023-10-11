import { ComponentType } from "../types/common-types.js";
import { Animation, Shape, Sprite, Transform, BaseComponent } from "./index.js";

export abstract class Renderable extends BaseComponent {
  type: ComponentType = "renderable";

  transform: Transform;
  sprite?: Sprite;
  animation?: Animation;
  shape?: Shape;

  constructor(transform: Transform) {
    super();
    this.transform = transform;
  }
}

export class RenderableSprite extends Renderable {
  constructor(transform: Transform, sprite: Sprite, animation?: Animation) {
    super(transform);
    this.sprite = sprite;
    this.animation = animation;
  }
}

export class RenderableShape extends Renderable {
  constructor(transform: Transform, shape: Shape) {
    super(transform);
    this.shape = shape;
  }
}
