import { Viewport } from "../graphics/viewport.js";
import { Timer } from "../time/timer.js";
import { SystemTypes } from "./system-types.js";
import { System } from "./system.js";
import { EntityManager } from "../entities/entity-manager.js";
import { Sprite, Position } from "../components/index.js";
import { Assert } from "../utils/assert.js";
import { ComponentType } from "../utils/types.js";

export class RenderSystem extends System {
  static requiredComponents: ComponentType[] = ["Sprite", "Position"];
  static systemType = SystemTypes.Graphics;

  viewport: Viewport;
  timer: Timer;

  constructor(entityManager: EntityManager, viewport: Viewport) {
    super(entityManager);
    Assert.instanceOf("viewport", viewport, Viewport);
    this.viewport = viewport;
    this.timer = new Timer();
  }

  drawSprite(sprite: Sprite, position: Position, sourceX: number, sourceY: number): void {
    this.viewport.ctx.drawImage(
      sprite.image,
      sourceX,
      sourceY,
      sprite.width,
      sprite.height,
      position.x,
      position.y,
      sprite.width,
      sprite.height
    );
  }

  update() {
    this.viewport.clear();
    const entities = this.entityManager.getEntitiesWithComponents(
      ...RenderSystem.requiredComponents
    );

    const delta = this.timer.delta();
    for (let i = 0; i < entities.length; i++) {
      const entityId = entities[i];
      const sprite = this.entityManager.getComponent(entityId, "Sprite")!;
      const pos = this.entityManager.getComponent(entityId, "Position")!;
      const animation = this.entityManager.getComponent(entityId, "Animation");

      if (!animation) {
        this.drawSprite(sprite, pos, 0, 0);
        continue;
      }

      // Update current animation frame of sprite
      const frameTotal = Math.floor(delta / animation.frameDuration);
      animation.loopCount = Math.floor(frameTotal / animation.sequence.length);
      if (animation.stop && animation.loopCount > 0)
        animation.frame = animation.sequence.length - 1;
      else animation.frame = frameTotal % animation.sequence.length;

      // Calculate source position in the sprite sheet
      const { width, height, columns } = sprite;
      const currentTile = animation.sequence[animation.frame];
      const currentColumn = currentTile % columns;
      const currentRow = Math.floor(currentTile / columns);
      const sourceX = currentColumn * width;
      const sourceY = currentRow * height;

      this.drawSprite(sprite, pos, sourceX, sourceY);
    }
  }
}
