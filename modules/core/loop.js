import { EventSystem } from "./event-system.js";
import { Enum } from "../lib/utils/enum.js";
import { Timer } from "./timer.js";

export class LoopEvents extends Enum {
  static {
    this.NextFrame = new LoopEvents();
    this.StopLoop = new LoopEvents();
    this.freeze();
  }
}

export class GameLoop {
  /** @type {number} */
  #lastFrame;
  /** @type {Timer} */
  clock;
  /** @type {number} */
  fpsInterval;
  /** @type {number} */
  targetFps;

  constructor(targetFps = 60) {
    this.clock = new Timer();
    this.targetFps = targetFps;
    this.fpsInterval = 1000 / targetFps;
    this.#lastFrame = -1;
    this.#bindEvents();
  }

  #bindEvents() {
    EventSystem.on(LoopEvents.StopLoop, () => this.stop(), 999);
  }

  start() {
    this.stopped = false;
    this.main(performance.now());
  }

  main(timestamp) {
    if (this.stopped) return cancelAnimationFrame(this.rafId);
    this.rafId = requestAnimationFrame((t) => this.main(t));

    Timer.step();
    const elapsed = timestamp - this.#lastFrame;
    if (elapsed < this.fpsInterval) return;
    this.#lastFrame = timestamp - (elapsed % this.fpsInterval);

    EventSystem.dispatch(LoopEvents.NextFrame, this.clock.tick());
  }

  stop() {
    this.stopped = true;
  }
}
