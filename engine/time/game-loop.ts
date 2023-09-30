import { GameEvents } from "../constants/enums.js";
import { Assert } from "../utils/assert.js";
import { Timer } from "./timer.js";
import { IEventManager, ILoop } from "../types/common-interfaces.js";

export class GameLoop implements ILoop {
  #lastFrame: number;
  #requestAnimationFrameId: number;
  eventManager: IEventManager;
  clock: Timer;
  fpsInterval: number;
  targetFps: number;
  stopped: boolean;

  constructor(eventManager: IEventManager, targetFps: number) {
    Assert.number("targetFps", targetFps);

    this.eventManager = eventManager;
    this.clock = new Timer();
    this.targetFps = targetFps;
    this.fpsInterval = 1000 / targetFps;
    this.#lastFrame = -1;
    this.#requestAnimationFrameId = -1;
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
    if (elapsed < this.fpsInterval) {
      return;
    }

    this.#lastFrame = timestamp - (elapsed % this.fpsInterval);
    this.eventManager.trigger(GameEvents.LOOP_STARTED, this.clock.tick());
  }

  stop(unloadAssets?: boolean): void {
    this.stopped = true;
    this.eventManager.trigger(GameEvents.LOOP_STOPPED, !!unloadAssets);
  }
}
