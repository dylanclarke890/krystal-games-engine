import { GameLoop } from "../modules/core/time/game-loop.js";

class Game {
  constructor() {
    this.loop = new GameLoop(60);
    this.loop.start();
  }
}

new Game();
