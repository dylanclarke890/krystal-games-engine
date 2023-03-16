import { Guard } from "../utils/guard.js";
import { EventSystem } from "../events/event-system.js";
import { GameEvents } from "../events/events.js";
import { Timer } from "./timer.js";

export class GameLoop {
  /** @type {number} */
  #lastFrame;
  /** @type {EventSystem} */
  eventSystem;
  /** @type {Timer} */
  clock;
  /** @type {number} */
  fpsInterval;
  /** @type {number} */
  targetFps;

  constructor(eventSystem, targetFps = 60) {
    Guard.againstNull({ eventSystem }).isInstanceOf(EventSystem);
    this.eventSystem = eventSystem;
    this.clock = new Timer();
    this.targetFps = targetFps;
    this.fpsInterval = 1000 / targetFps;
    this.#lastFrame = -1;
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

    this.eventSystem.dispatch(GameEvents.Loop_NextFrame, this.clock.tick());
  }

  stop(unloadAssets) {
    this.stopped = true;
    this.eventSystem.dispatch(GameEvents.Loop_Stop, !!unloadAssets);
  }
}
