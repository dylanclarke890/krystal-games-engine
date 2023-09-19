import { PriorityQueue, PriorityLevel } from "../utils/priority-queue.js";
import { Enum } from "../utils/enum.js";
import { Assert } from "../utils/assert.js";

export class EventSystem {
  #subscribers: Map<Enum, PriorityQueue<EventHandler<any>>>;
  #parent: EventSystem | undefined;

  constructor(parent?: EventSystem) {
    this.#subscribers = new Map();
    if (typeof parent !== "undefined") {
      Assert.instanceOf("parent", parent, EventSystem);
      this.#parent = parent;
    }
  }

  /** Get the parent EventSystem. */
  get parent(): EventSystem | undefined {
    return this.#parent;
  }

  /** Subscribe to an event. */
  on<T>(event: Enum, listener: EventHandler<T>, priority: number | PriorityLevel = PriorityLevel.None) {
    priority ??= PriorityLevel.None;
    if (!this.#subscribers.has(event)) {
      this.#subscribers.set(event, new PriorityQueue());
    }

    const priorityLevel = priority instanceof PriorityLevel ? priority.valueOf() : priority;
    this.#subscribers.get(event)!.add(listener, priorityLevel);
  }

  /** Unsubscribe from an event. */
  off<T>(event: Enum, listener: EventHandler<T>) {
    const queue = this.#subscribers.get(event);

    if (typeof queue === "undefined") {
      return;
    }

    return queue.remove(listener);
  }

  /** Trigger an event. */
  trigger<T>(event: Enum, data?: T) {
    const queue = this.#subscribers.get(event);

    if (typeof queue !== "undefined") {
      queue.forEach((listener) => listener(data));
    }

    if (typeof this.#parent !== "undefined") {
      this.#parent.trigger(event, data);
    }
  }
}
