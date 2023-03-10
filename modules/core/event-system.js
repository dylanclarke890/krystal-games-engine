import { PQueue, PriorityLevel } from "../lib/data-structures/p-queue.js";
import { Guard } from "../lib/sanity/guard.js";
import { Enum } from "../lib/utils/enum.js";

class GameEventSystem {
  /** @type {Map<import("../lib/utils/enum.js").Enum, PQueue>} */
  #subscribers;
  /** @type {GameEventSystem} */
  #parent;

  constructor(parent = null) {
    this.#subscribers = new Map();
    if (parent) {
      Guard.isInstanceOf({ parent }, GameEventSystem);
      this.#parent = parent;
    }
  }

  /**
   * Get the parent EventSystem.
   */
  get parent() {
    return this.#parent;
  }

  /**
   * Subscribe to an event.
   * @param {import("../lib/utils/enum.js").Enum} event
   * @param {(data:any) => void} listener
   * @param {number|PriorityLevel} priority
   */
  on(event, listener, priority = PriorityLevel.None) {
    if (!this.#subscribers.has(event)) this.#subscribers.set(event, new PQueue());
    this.#subscribers
      .get(event)
      .add(listener, priority instanceof PriorityLevel ? priority.valueOf() : priority);
  }

  /**
   * Unsubscribe from an event.
   * @param {import("../lib/utils/enum.js").Enum} event
   * @param {(data:any) => void} listener
   */
  off(event, listener) {
    const queue = this.#subscribers.get(event);
    if (!queue) return;
    return queue.remove(listener);
  }

  /**
   * Dispatch an event to subscribers.
   * @param {import("../lib/utils/enum.js").Enum} event
   * @param {any} data
   */
  dispatch(event, data) {
    const queue = this.#subscribers.get(event);
    if (queue) queue.forEach((listener) => listener(data));
    if (this.#parent) this.#parent.dispatch(event, data);
  }
}

export class GameEvents extends Enum {
  //#region System (1 - 10)
  static System_ReadyToLoad = new GameEvents();
  static System_PreloadingAssets = new GameEvents();
  static System_PreloadingComplete = new GameEvents();
  //#endregion System (1 - 10)

  //region Loop (11 - 20)
  static Loop_Start = new GameEvents();
  static Loop_NextFrame = new GameEvents();
  static Loop_Pause = new GameEvents();
  static Loop_Stop = new GameEvents();
  static Loop_Restart = new GameEvents();
  //endregion Loop (11 - 20)

  //region Input (21 - 40)
  static Mouse_Down = new GameEvents();
  static Mouse_Move = new GameEvents();
  static Mouse_Up = new GameEvents();
  static Mouse_Click = new GameEvents();
  static Window_Resized = new GameEvents();
  //endregion Input (21 - 40)

  //region Sound (41 - 50)
  static Sound_UnlockWebAudio = new GameEvents();
  //endregion Sound (41 - 50)

  static {
    this.freeze();
  }
}

export const EventSystem = new GameEventSystem();
