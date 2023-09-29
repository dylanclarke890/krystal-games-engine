import { BaseSystem } from "../systems/system.js";
import { SystemTypes } from "../constants/enums.js";
import { Sprite, Position, Shape } from "../components/2d/index.js";
import { Viewport } from "./viewport.js";
import { Assert } from "../utils/assert.js";
import { InvalidOperationError } from "../types/errors.js";
import { ComponentType, Components } from "../types/common-types.js";
import { IEntityManager, IEventSystem } from "../types/common-interfaces.js";

type SystemComponents = Components<"Position", "Animation" | "Sprite" | "Shape">;
export class RenderSystem extends BaseSystem {
  static requiredComponents: ComponentType[] = ["Position"];
  static components: ComponentType[] = [...this.requiredComponents, "Sprite", "Animation", "Shape"];
  static systemType = SystemTypes.Graphics;

  viewport: Viewport;

  constructor(entityManager: IEntityManager, eventSystem: IEventSystem, viewport: Viewport) {
    super(entityManager, eventSystem);
    Assert.instanceOf("viewport", viewport, Viewport);
    this.viewport = viewport;
  }

  update(dt: number, entities: Set<number>) {
    this.viewport.clear();

    for (const id of entities) {
      const components = this.entityManager.getComponents(id, RenderSystem.components) as SystemComponents;

      if (typeof components.Shape !== "undefined") {
        this.drawShape(components.Shape, components.Position);
      }

      if (typeof components.Sprite !== "undefined") {
        if (typeof components.Animation === "undefined") {
          this.drawSprite(components.Sprite, components.Position, 0, 0);
          continue;
        }

        // Update current animation frame of sprite
        const frameTotal = Math.floor(dt / components.Animation.frameDuration);
        components.Animation.loopCount = Math.floor(frameTotal / components.Animation.sequence.length);
        if (components.Animation.stop && components.Animation.loopCount > 0)
          components.Animation.frame = components.Animation.sequence.length - 1;
        else components.Animation.frame = frameTotal % components.Animation.sequence.length;

        // Calculate source position in the sprite sheet
        const { width, height, columns } = components.Sprite;
        const currentTile = components.Animation.sequence[components.Animation.frame];
        const currentColumn = currentTile % columns;
        const currentRow = Math.floor(currentTile / columns);
        const sourceX = currentColumn * width;
        const sourceY = currentRow * height;

        this.drawSprite(components.Sprite, components.Position, sourceX, sourceY);
      }
    }
  }

  drawSprite(sprite: Sprite, position: Position, sourceX: number, sourceY: number): void {
    const { x, y } = position;
    const { width, height, image } = sprite;
    this.viewport.ctx.drawImage(image, sourceX, sourceY, width, height, x, y, width, height);
  }

  drawShape(shape: Shape, position: Position) {
    const { x, y } = position;
    this.viewport.ctx.fillStyle = shape.color;

    switch (shape.type) {
      case "rectangle": {
        this.viewport.ctx.fillRect(x, y, shape.width || 0, shape.height || 0);
        break;
      }
      case "circle": {
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
