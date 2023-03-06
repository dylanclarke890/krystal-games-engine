import { EventSystem, LoopEvents } from "./event-system.js";
import { Timer } from "./timer.js";

export class GameLoop {
  #lastFrame;

  constructor(targetFps = 60) {
    this.clock = new Timer();
    this.targetFps = targetFps;
    this.fpsInterval = 1000 / targetFps;
    this.#lastFrame = -1;
    this.#bindEvents();
  }

  #bindEvents() {
    EventSystem.on(LoopEvents.StopLoop, () => this.stop());
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
