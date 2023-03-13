import { Screen } from "../modules/core/graphics/screen.js";
import { EventSystem, GameEvents } from "../modules/core/event-system.js";
import { GameLoop } from "../modules/core/time/game-loop.js";
import { ComponentContainer } from "../modules/core/components/component-container.js";
import { VelocityComponent } from "../modules/core/components/velocity-component.js";
import { PositionComponent } from "../modules/core/components/position-component.js";
import { SpriteComponent } from "../modules/core/components/sprite-component.js";
import { RenderSystem } from "../modules/core/systems/render-system.js";
import { VelocitySystem } from "../modules/core/systems/velocity-system.js";
import { PositionSystem } from "../modules/core/systems/position-system.js";
import { EntityManager } from "../modules/core/managers/entity-manager.js";

const moverAsset = "test-data/assets/entities/mover.png";

const sprite = new SpriteComponent(moverAsset);
const pos = new PositionComponent(50, 50);
const vel = new VelocityComponent(0, 0);
const mover = new ComponentContainer(sprite, pos, vel);

class Game {
  constructor() {
    this.loop = new GameLoop(60);
    this.screen = new Screen(500, 500);
    const entityManager = new EntityManager();
    this.entityManager = entityManager;
    entityManager.createEntity("Mover");
    this.systems = [new RenderSystem(), new VelocitySystem(), new PositionSystem()];
    this.entities = [mover];

    this.tick = 0;
    this.#bindEvents();
    this.loop.start();
  }

  #bindEvents() {
    EventSystem.on(GameEvents.Loop_NextFrame, (tick) => this.nextFrame(tick));
  }

  nextFrame(tick) {
    this.tick = tick;
    this.update();
    this.draw();
  }

  update() {
    for (let i = 0; i < this.systems.length; i++) this.systems[i].update();
  }
  draw() {
    this.screen.clear();
    this.screen.drawRect(250, 250, 200, 200, "orange");
    this.screen.ctx.drawImage(this.img, 200, 200);
  }
}

new Game();
