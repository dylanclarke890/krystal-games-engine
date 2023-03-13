import { Screen } from "../modules/core/graphics/screen.js";
import { EventSystem, GameEvents } from "../modules/core/event-system.js";
import { GameLoop } from "../modules/core/time/game-loop.js";

const moverAssets = "test-data/assets/entities/mover.png";

class Game {
  constructor() {
    this.loop = new GameLoop(60);
    this.screen = new Screen(500, 500);
    this.tick = 0;
    this.#bindEvents();
    this.img = new Image();
    this.img.src = moverAssets;
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

  update() {}
  draw() {
    this.screen.clear();
    this.screen.drawRect(250, 250, 200, 200, "orange");
    this.screen.ctx.drawImage(this.img, 200, 200);
  }
}

new Game();
