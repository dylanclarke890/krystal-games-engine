import { PQueue, PriorityLevel } from "../utils/priority-queue.js";
import { Guard } from "../utils/guard.js";
import { Enum } from "../utils/enum.js";

type Listener = (data?: any) => void;

export class EventSystem {
  #subscribers: Map<Enum, PQueue<Listener>>;
  #parent: EventSystem | undefined;

  constructor(parent?: EventSystem) {
    this.#subscribers = new Map();
    if (parent) {
      Guard.isInstanceOf({ parent }, EventSystem);
      this.#parent = parent;
    }
  }

  /**
   * Get the parent EventSystem.
   */
  get parent(): EventSystem | undefined {
    return this.#parent;
  }

  /**
   * Subscribe to an event.
   */
  on(event: Enum, listener: Listener, priority: number | PriorityLevel = PriorityLevel.None) {
    if (!this.#subscribers.has(event)) this.#subscribers.set(event, new PQueue());
    this.#subscribers
      .get(event)!
      .add(listener, priority instanceof PriorityLevel ? priority.valueOf() : priority);
  }

  /**
   * Unsubscribe from an event.
   */
  off(event: Enum, listener: Listener) {
    const queue = this.#subscribers.get(event);
    if (!queue) return;
    return queue.remove(listener);
  }

  /**
   * Dispatch an event to subscribers.
   */
  dispatch(event: Enum, data?: any) {
    const queue = this.#subscribers.get(event);
    if (queue) queue.forEach((listener) => listener(data));
    if (this.#parent) this.#parent.dispatch(event, data);
  }
}
