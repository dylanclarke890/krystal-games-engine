import { Viewport } from "../graphics/viewport.js";
import { Guard } from "../utils/guard.js";
import { System } from "./system.js";

export class RenderSystem extends System {
  static requiredComponents = ["SpriteComponent", "PositionComponent"];

  /**
   * @param {import("../managers/entity-manager.js").EntityManager} entityManager
   * @param {Viewport} viewport
   */
  constructor(entityManager, viewport) {
    super(entityManager);
    Guard.againstNull({ viewport }).isInstanceOf(Viewport);
    this.viewport = viewport;
  }

  update() {
    this.viewport.clear();
    const entities = this.entityManager.getEntitiesWithComponents(
      "SpriteComponent",
      "PositionComponent"
    );
    for (let i = 0; i < entities.length; i++) {
      const entityId = entities[i];
      const pos = this.entityManager.getComponent(entityId, "PositionComponent");
      const sprite = this.entityManager.getComponent(entityId, "SpriteComponent");
      this.viewport.ctx.drawImage(sprite.image, pos.x, pos.y, sprite.width, sprite.height);
    }
  }
}
