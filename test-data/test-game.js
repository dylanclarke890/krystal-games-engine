import { CanvasContext } from "../modules/core/canvas-context.js";
import { GameLoop } from "../modules/core/time/game-loop.js";

class Game {
  constructor() {
    this.loop = new GameLoop(60);
    this.ctx = new CanvasContext(500, 500);
    this.loop.start();
  }
}

new Game();
