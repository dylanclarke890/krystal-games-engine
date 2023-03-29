import { Viewport } from "../graphics/viewport.js";
import { Timer } from "../time/timer.js";
import { Guard } from "../utils/guard.js";
import { SystemTypes } from "./system-types.js";
import { System } from "./system.js";

export class RenderSystem extends System {
  static requiredComponents = ["SpriteComponent", "PositionComponent"];
  static systemType = SystemTypes.Graphics;

  viewport;
  timer;

  /**
   * @param {import("../entities/entity-manager.js").EntityManager} entityManager
   * @param {Viewport} viewport
   */
  constructor(entityManager, viewport) {
    super(entityManager);
    Guard.againstNull({ viewport }).isInstanceOf(Viewport);
    this.viewport = viewport;
    this.timer = new Timer();
  }

  update() {
    this.viewport.clear();
    const entities = this.entityManager.getEntitiesWithComponents(
      ...RenderSystem.requiredComponents
    );

    const delta = this.timer.delta();
    for (let i = 0; i < entities.length; i++) {
      const entityId = entities[i];
      const sprite = this.entityManager.getComponent(entityId, "SpriteComponent");
      const animation = this.entityManager.getComponent(entityId, "AnimationComponent");

      // Update current animation frame of sprite
      const frameTotal = Math.floor(delta / animation.frameDuration);
      sprite.loopCount = Math.floor(frameTotal / animation.sequence.length);
      if (animation.stop && animation.loopCount > 0)
        animation.frame = animation.sequence.length - 1;
      else animation.frame = frameTotal % animation.sequence.length;

      // Calculate source position in the sprite sheet
      const { width, height, image, columns } = sprite;
      const currentTile = animation.sequence[animation.frame];
      const currentColumn = currentTile % columns;
      const currentRow = Math.floor(currentTile / columns);
      const sourceX = currentColumn * width;
      const sourceY = currentRow * height;

      const pos = this.entityManager.getComponent(entityId, "PositionComponent");
      this.viewport.ctx.drawImage(
        image,
        sourceX,
        sourceY,
        width,
        height,
        pos.x,
        pos.y,
        width,
        height
      );
    }
  }
}
