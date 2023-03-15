import { Screen } from "../modules/core/graphics/screen.js";
import { EventSystem, GameEvents } from "../modules/core/event-system.js";
import { GameLoop } from "../modules/core/time/game-loop.js";
import { World } from "../modules/core/world.js";
import { RenderSystem } from "../modules/core/systems/render-system.js";
import { PhysicsSystem } from "../modules/core/systems/physics-system.js";
import { PositionSystem } from "../modules/core/systems/position-system.js";
import { PositionComponent } from "../modules/core/components/position-component.js";
import { SpriteComponent } from "../modules/core/components/sprite-component.js";
import { EntityManager } from "../modules/core/managers/entity-manager.js";

class Game {
  constructor() {
    this.loop = new GameLoop(60);
    this.screen = new Screen(500, 500);
    this.managers = {
      entity: new EntityManager(),
    };
    this.systems = {
      position: new PositionSystem(this.managers.entity),
      graphics: new RenderSystem(this.managers.entity),
      physics: new PhysicsSystem(this.managers.entity),
    };
    this.world = new World([this.systems.position, this.systems.physics, this.systems.graphics]);
    const testEntityId = this.managers.entity.createEntity();
    this.managers.entity.addComponent(testEntityId, new PositionComponent(50, 50));
    this.managers.entity.addComponent(
      testEntityId,
      new SpriteComponent("test-data/assets/entities/mover.png", 24, 8)
    );
    this.#bindEvents();
    this.loop.start();
  }

  #bindEvents() {
    EventSystem.on(GameEvents.Loop_NextFrame, (tick) => this.nextFrame(tick));
  }

  nextFrame(tick) {
    this.tick = tick;
    this.world.update(tick);
  }
}

new Game();
