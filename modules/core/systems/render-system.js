import { Guard } from "../../lib/sanity/guard.js";
import { SystemBase } from "./base-system.js";

export class RenderSystem extends SystemBase {
  /**
   * @param {import("../managers/entity-manager.js")} entityManager
   * @param {import("../graphics/screen.js").Screen} screen
   */
  constructor(entityManager, screen) {
    super(entityManager);
    Guard.againstNull({ screen });
    this.screen = screen;
  }

  update() {
    this.screen.clear();
    const entities = this.entityManager.getEntitiesWithComponents(
      "SpriteComponent",
      "PositionComponent"
    );
    for (let i = 0; i < entities.length; i++) {
      const entityId = entities[i];
      const pos = this.entityManager.getComponent(entityId, "PositionComponent");
      const sprite = this.entityManager.getComponent(entityId, "SpriteComponent");
      this.screen.ctx.drawImage(sprite.image, pos.x, pos.y, sprite.width, sprite.height);
    }
  }
}
