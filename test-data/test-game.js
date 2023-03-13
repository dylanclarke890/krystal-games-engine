import { CanvasContext } from "../modules/core/canvas-context.js";
import { EventSystem, GameEvents } from "../modules/core/event-system.js";
import { GameLoop } from "../modules/core/time/game-loop.js";

class Game {
  constructor() {
    this.loop = new GameLoop(60);
    this.ctx = new CanvasContext(500, 500);
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

  update() {}
  draw() {
    this.ctx.clear();
    this.ctx.drawRect(250, 250, 200, 200, "orange");
  }
}

new Game();
