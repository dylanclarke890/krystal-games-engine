import { GameEventType } from "../constants/events.js";
import { ILoop } from "../types/common-interfaces.js";
import { GameContext } from "../core/context.js";
import { LoopSettings } from "../core/config.js";

export class GameLoop implements ILoop {
  #lastFrame: number;
  #requestAnimationFrameId: number;
  #accumulator: number;
  context: GameContext;
  fpsInterval: number;
  targetFps: number;
  stopped: boolean;
  maxFrameTime: number;

  constructor(context: GameContext) {
    this.context = context;
    const loopSettings = context.config.getObject<LoopSettings>("loop");
    this.targetFps = loopSettings?.targetFps ?? 60;
    this.maxFrameTime = loopSettings?.maxFrameTime ?? 100;
    this.fpsInterval = 1000 / this.targetFps;
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

    this.#requestAnimationFrameId = requestAnimationFrame(this.main.bind(this));
    const elapsed = timestamp - this.#lastFrame;
    this.#lastFrame = timestamp;
    this.#accumulator += elapsed;

    if (this.#accumulator > this.maxFrameTime) {
      this.#accumulator = this.maxFrameTime;
    }

    // If it's been enough time, update the game logic and reduce the accumulator
    while (this.#accumulator >= this.fpsInterval) {
      this.context.events.trigger(GameEventType.LOOP_STARTED, this.fpsInterval / 1000);
      this.#accumulator -= this.fpsInterval;
    }
  }

  stop(unloadAssets?: boolean): void {
    this.stopped = true;
    this.context.events.trigger(GameEventType.LOOP_STOPPED, !!unloadAssets);
  }
}
