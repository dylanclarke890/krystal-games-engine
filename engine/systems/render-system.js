import { Viewport } from "../graphics/viewport.js";
import { Timer } from "../time/timer.js";
import { Guard } from "../utils/guard.js";
import { SystemTypes } from "./system-types.js";
import { System } from "./system.js";

export class RenderSystem extends System {
  static requiredComponents = ["SpriteComponent", "PositionComponent"];
  static systemType = SystemTypes.Graphics;

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

      // Update current animation frame of sprite
      const frameTotal = Math.floor(delta / sprite.frameDuration);
      sprite.loopCount = Math.floor(frameTotal / sprite.sequence.length);
      if (sprite.stop && sprite.loopCount > 0) sprite.frame = sprite.sequence.length - 1;
      else sprite.frame = frameTotal % sprite.sequence.length;
      sprite.tile = sprite.sequence[sprite.frame];

      const pos = this.entityManager.getComponent(entityId, "PositionComponent");
      this.viewport.ctx.drawImage(sprite.image, pos.x, pos.y, sprite.width, sprite.height);
    }
  }
}
