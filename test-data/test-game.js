import { Screen } from "../modules/core/graphics/screen.js";
import { EventSystem, GameEvents } from "../modules/core/event-system.js";
import { GameLoop } from "../modules/core/time/game-loop.js";
import { World } from "../modules/core/world.js";

class Game {
  constructor() {
    this.loop = new GameLoop(60);
    this.screen = new Screen(500, 500);
    this.world = new World();
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
