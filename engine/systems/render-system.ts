import { Viewport } from "../graphics/viewport.js";
import { Timer } from "../time/timer.js";
import { SystemTypes } from "./system-types.js";
import { System } from "./system.js";
import { EntityManager } from "../entities/entity-manager.js";
import { Sprite, Position } from "../components/index.js";
import { Assert } from "../utils/assert.js";
import { ComponentMap, ComponentType, DefinedExcept } from "../utils/types.js";

type RequiredComponents = "Sprite" | "Position";
type OptionalComponents = "Animation";

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
    const { x, y } = position;
    const { width, height, image } = sprite;
    this.viewport.ctx.drawImage(image, sourceX, sourceY, width, height, x, y, width, height);
  }

  update() {
    this.viewport.clear();
    const entities = this.entityManager.getEntitiesWithComponents(
      ...RenderSystem.requiredComponents
    );

    const delta = this.timer.delta();
    for (let i = 0; i < entities.length; i++) {
      const entityId = entities[i];
      const entity = this.entityManager.getComponents(
        entityId,
        "Position",
        "Sprite",
        "Animation"
      ) as DefinedExcept<ComponentMap<RequiredComponents | OptionalComponents>, OptionalComponents>;

      if (!entity.Animation) {
        this.drawSprite(entity.Sprite, entity.Position, 0, 0);
        continue;
      }

      // Update current animation frame of sprite
      const frameTotal = Math.floor(delta / entity.Animation.frameDuration);
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
