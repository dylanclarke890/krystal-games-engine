import { Viewport } from "../graphics/viewport.js";
import { SystemTypes } from "./system-types.js";
import { System } from "./system.js";
import { EntityManager } from "../entities/entity-manager.js";
import { Sprite, Position, Shape } from "../components/index.js";
import { Assert } from "../utils/assert.js";
import { ComponentType, SystemComponents } from "../utils/types.js";

type RenderSystemComponents = SystemComponents<"Position", "Animation" | "Sprite" | "Shape">;
export class RenderSystem extends System {
  static requiredComponents: ComponentType[] = ["Position"];
  static components: ComponentType[] = [...this.requiredComponents, "Sprite", "Animation", "Shape"];
  static systemType = SystemTypes.Graphics;

  viewport: Viewport;

  constructor(entityManager: EntityManager, viewport: Viewport) {
    super(entityManager);
    Assert.instanceOf("viewport", viewport, Viewport);
    this.viewport = viewport;
  }

  update(dt: number, entities: number[]) {
    this.viewport.clear();

    for (let i = 0; i < entities.length; i++) {
      const entityId = entities[i];
      const entity = this.entityManager.getComponents(entityId, RenderSystem.components) as RenderSystemComponents;

      if (typeof entity.Shape !== "undefined") {
        this.drawShape(entity.Shape, entity.Position);
      }

      if (typeof entity.Sprite !== "undefined") {
        if (typeof entity.Animation === "undefined") {
          this.drawSprite(entity.Sprite, entity.Position, 0, 0);
          continue;
        }

        // Update current animation frame of sprite
        const frameTotal = Math.floor(dt / entity.Animation.frameDuration);
        entity.Animation.loopCount = Math.floor(frameTotal / entity.Animation.sequence.length);
        if (entity.Animation.stop && entity.Animation.loopCount > 0)
          entity.Animation.frame = entity.Animation.sequence.length - 1;
        else entity.Animation.frame = frameTotal % entity.Animation.sequence.length;

        // Calculate source position in the sprite sheet
        const { width, height, columns } = entity.Sprite;
        const currentTile = entity.Animation.sequence[entity.Animation.frame];
        const currentColumn = currentTile % columns;
        const currentRow = Math.floor(currentTile / columns);
        const sourceX = currentColumn * width;
        const sourceY = currentRow * height;

        this.drawSprite(entity.Sprite, entity.Position, sourceX, sourceY);
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
        throw new Error(`Unable to draw shape: shape type not recognised: ${shape.type}.`);
      }
    }
  }
}
