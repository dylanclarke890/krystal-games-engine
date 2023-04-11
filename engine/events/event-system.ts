import { PQueue, PriorityLevel } from "../utils/priority-queue.js";
import { Guard } from "../utils/guard.js";
import { Enum } from "../utils/enum.js";

type Listener<T> = (data: T) => void;

export class EventSystem {
  #subscribers: Map<Enum, PQueue<Listener<any>>>;
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
  on<T>(event: Enum, listener: Listener<T>, priority: number | PriorityLevel = PriorityLevel.None) {
    if (!this.#subscribers.has(event)) this.#subscribers.set(event, new PQueue());
    this.#subscribers
      .get(event)!
      .add(listener, priority instanceof PriorityLevel ? priority.valueOf() : priority);
  }

  /**
   * Unsubscribe from an event.
   */
  off<T>(event: Enum, listener: Listener<T>) {
    const queue = this.#subscribers.get(event);
    if (!queue) return;
    return queue.remove(listener);
  }

  /**
   * Dispatch an event to subscribers.
   */
  dispatch<T>(event: Enum, data?: T) {
    const queue = this.#subscribers.get(event);
    if (queue) queue.forEach((listener) => listener(data));
    if (this.#parent) this.#parent.dispatch(event, data);
  }
}
