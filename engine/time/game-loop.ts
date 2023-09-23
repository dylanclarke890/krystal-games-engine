import { GameEvents } from "../constants/enums.js";
import { Assert } from "../utils/assert.js";
import { Timer } from "./timer.js";
import { IEventSystem } from "../types/common-interfaces.js";

export class GameLoop {
  #lastFrame: number;
  eventSystem: IEventSystem;
  clock: Timer;
  fpsInterval: number;
  targetFps: number;
  #requestAnimationFrameId: number;
  stopped: boolean;

  constructor(eventSystem: IEventSystem, targetFps: number) {
    Assert.number("targetFps", targetFps);

    this.eventSystem = eventSystem;
    this.clock = new Timer();
    this.targetFps = targetFps;
    this.fpsInterval = 1000 / targetFps;
    this.#lastFrame = -1;
    this.#requestAnimationFrameId = -1;
    this.stopped = false;
  }

  start(): void {
    this.stopped = false;
    this.eventSystem.trigger(GameEvents.Loop_BeforeStart);
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
    this.eventSystem.trigger(GameEvents.Loop_NextFrame, this.clock.tick());
  }

  stop(unloadAssets?: boolean): void {
    this.stopped = true;
    this.eventSystem.trigger(GameEvents.Loop_Stop, !!unloadAssets);
  }
}
