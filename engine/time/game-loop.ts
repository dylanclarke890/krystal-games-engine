import { GameEvents } from "../constants/enums.js";
import { Assert } from "../utils/assert.js";
import { Timer } from "./timer.js";
import { ILoop } from "../types/common-interfaces.js";
import { GameContext } from "../core/context.js";

export class GameLoop implements ILoop {
  #lastFrame: number;
  #requestAnimationFrameId: number;
  #accumulator: number;
  context: GameContext;
  clock: Timer;
  fpsInterval: number;
  targetFps: number;
  stopped: boolean;

  constructor(context: GameContext, targetFps: number) {
    Assert.number("targetFps", targetFps);
    this.context = context;
    this.clock = new Timer();
    this.targetFps = targetFps;
    this.fpsInterval = 1000 / targetFps;
    this.#lastFrame = -1;
    this.#requestAnimationFrameId = -1;
    this.#accumulator = 0;
    this.stopped = false;
  }

  start(): void {
    this.stopped = false;
    this.main(performance.now());
  }

  main(timestamp: number): void {
    if (this.stopped) {
      cancelAnimationFrame(this.#requestAnimationFrameId);
      return;
    }

    this.#requestAnimationFrameId = requestAnimationFrame((t) => this.main(t));
    Timer.step();

    const elapsed = timestamp - this.#lastFrame;
    this.#lastFrame = timestamp;

    this.#accumulator += elapsed;

    // If it's been enough time, update the game logic and reduce the accumulator
    while (this.#accumulator >= this.fpsInterval) {
      this.context.events.trigger(GameEvents.LOOP_STARTED, this.fpsInterval / 1000);
      this.#accumulator -= this.fpsInterval;
    }
  }

  stop(unloadAssets?: boolean): void {
    this.stopped = true;
    this.context.events.trigger(GameEvents.LOOP_STOPPED, !!unloadAssets);
  }
}
