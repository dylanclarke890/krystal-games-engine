import { Assert } from "../utils/assert.js";
import { EventSystem } from "../events/event-system.js";
import { GameEvents } from "../events/events.js";
import { Timer } from "./timer.js";

export class GameLoop {
  #lastFrame: number;
  eventSystem: EventSystem;
  clock: Timer;
  fpsInterval: number;
  targetFps: number;
  #rafId: number;
  stopped: boolean;

  constructor(eventSystem: EventSystem, targetFps = 60) {
    Assert.instanceOf("eventSystem", eventSystem, EventSystem);
    this.eventSystem = eventSystem;
    this.clock = new Timer();
    this.targetFps = targetFps;
    this.fpsInterval = 1000 / targetFps;
    this.#lastFrame = -1;
    this.#rafId = -1;
    this.stopped = false;
  }

  start() {
    this.stopped = false;
    this.eventSystem.dispatch(GameEvents.Loop_BeforeStart);
    this.main(performance.now());
  }

  main(timestamp: number) {
    if (this.stopped) return cancelAnimationFrame(this.#rafId);
    this.#rafId = requestAnimationFrame((t) => this.main(t));

    Timer.step();
    const elapsed = timestamp - this.#lastFrame;
    if (elapsed < this.fpsInterval) return;
    this.#lastFrame = timestamp - (elapsed % this.fpsInterval);

    this.eventSystem.dispatch(GameEvents.Loop_NextFrame, this.clock.tick());
  }

  stop(unloadAssets?: boolean) {
    this.stopped = true;
    this.eventSystem.dispatch(GameEvents.Loop_Stop, !!unloadAssets);
  }
}
