import { Sprite, Shape } from "../components/index.js";
import { Viewport } from "../graphics/viewport.js";
import { Assert } from "../utils/assert.js";
import { InvalidOperationError } from "../types/errors.js";
import { IEntityManager, IEventManager } from "../types/common-interfaces.js";
import { BaseSystem } from "./base-system.js";
import { BaseComponent } from "../components/base.js";
import { Renderable } from "../components/renderable.js";
import { ShapeType } from "../constants/enums.js";
import { Vector2 } from "../maths/vector2.js";

export class RenderSystem extends BaseSystem {
  name = "RenderSystem";
  priority: number = 10;
  requiredComponents: string[] = ["Position"];
  components: string[] = [...this.requiredComponents, "Sprite", "Animation", "Shape"];

  viewport: Viewport;

  constructor(entityManager: IEntityManager, eventManager: IEventManager, viewport: Viewport) {
    super(entityManager, eventManager);
    Assert.instanceOf("viewport", viewport, Viewport);
    this.viewport = viewport;
  }

  isInterestedInComponent(component: BaseComponent): boolean {
    return component.type === "renderable";
  }

  belongsToSystem(entity: number): boolean {
    const renderable = this.entityManager.getComponent<Renderable>(entity, "renderable");
    return typeof renderable !== "undefined";
  }

  update(dt: number, entities: Set<number>) {
    this.viewport.clear();

    for (const id of entities) {
      const entity = this.entityManager.getComponent<Renderable>(id, "renderable");
      if (typeof entity === "undefined") {
        continue;
      }

      if (typeof entity.shape !== "undefined") {
        this.drawShape(entity.shape, entity.transform.position);
      }

      if (typeof entity.sprite !== "undefined") {
        if (typeof entity.animation === "undefined") {
          this.drawSprite(entity.sprite, entity.transform.position, 0, 0);
          continue;
        }

        // Update current animation frame of sprite
        const frameTotal = Math.floor(dt / entity.animation.frameDuration);
        entity.animation.loopCount = Math.floor(frameTotal / entity.animation.sequence.length);
        if (entity.animation.stop && entity.animation.loopCount > 0)
          entity.animation.frame = entity.animation.sequence.length - 1;
        else entity.animation.frame = frameTotal % entity.animation.sequence.length;

        // Calculate source position in the sprite sheet
        const { width, height, columns } = entity.sprite;
        const currentTile = entity.animation.sequence[entity.animation.frame];
        const currentColumn = currentTile % columns;
        const currentRow = Math.floor(currentTile / columns);
        const sourceX = currentColumn * width;
        const sourceY = currentRow * height;

        this.drawSprite(entity.sprite, entity.transform.position, sourceX, sourceY);
      }
    }
  }

  drawSprite(sprite: Sprite, position: Vector2, sourceX: number, sourceY: number): void {
    const { x, y } = position;
    const { width, height, image } = sprite;
    this.viewport.ctx.drawImage(image, sourceX, sourceY, width, height, x, y, width, height);
  }

  drawShape(shape: Shape, position: Vector2) {
    const { x, y } = position;
    this.viewport.ctx.fillStyle = shape.color;

    switch (shape.shapeType) {
      case ShapeType.Rectangle: {
        this.viewport.ctx.fillRect(x, y, shape.size?.x || 0, shape.size?.y || 0);
        break;
      }
      case ShapeType.Circle: {
        this.viewport.ctx.beginPath();
        this.viewport.ctx.arc(x, y, shape.radius || 0, 0, Math.PI * 2);
        this.viewport.ctx.fill();
        break;
      }
      default: {
        throw new InvalidOperationError("Shape type not recognised - unable to draw.", shape);
      }
    }
  }
}
