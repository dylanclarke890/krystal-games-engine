import { PQueue, PriorityLevel } from "../lib/data-structures/p-queue.js";
import { Guard } from "../lib/sanity/guard.js";
import { Enum } from "../lib/utils/enum.js";

class GameEventSystem {
  /** @type {Map<Enum, PQueue>} */
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
   * @param {Enum} event
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
   * @param {Enum} event
   * @param {(data:any) => void} listener
   */
  off(event, listener) {
    const queue = this.#subscribers.get(event);
    if (!queue) return;
    return queue.remove(listener);
  }

  /**
   * Dispatch an event to subscribers.
   * @param {Enum} event
   * @param {any} data
   */
  dispatch(event, data) {
    const queue = this.#subscribers.get(event);
    if (queue) queue.forEach((listener) => listener(data));
    if (this.#parent) this.#parent.dispatch(event, data);
  }
}

export class GameEvents extends Enum {
  //#region System
  static System_ReadyToLoad = new GameEvents();
  static System_PreloadingAssets = new GameEvents();
  static System_PreloadingComplete = new GameEvents();
  //#endregion System

  //region Entity
  static Entity_Created = new GameEvents();
  static Entity_Destroyed = new GameEvents();
  //endregion Entity

  //region Loop
  static Loop_Start = new GameEvents();
  static Loop_NextFrame = new GameEvents();
  static Loop_Pause = new GameEvents();
  static Loop_Stop = new GameEvents();
  static Loop_Restart = new GameEvents();
  //endregion Loop

  //region Input
  static Mouse_Down = new GameEvents();
  static Mouse_Move = new GameEvents();
  static Mouse_Up = new GameEvents();
  static Mouse_Click = new GameEvents();
  static Window_Resized = new GameEvents();
  //endregion Input

  //region Sound
  static Sound_UnlockWebAudio = new GameEvents();
  static Sound_Played = new GameEvents();
  static Sound_Paused = new GameEvents();
  static Sound_Stopped = new GameEvents();
  static Sound_Looped = new GameEvents();
  //endregion Sound

  static {
    this.freeze();
  }
}

export const EventSystem = new GameEventSystem();
