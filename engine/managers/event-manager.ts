import { PriorityLevel } from "../constants/enums.js";
import { PriorityQueue } from "../utils/priority-queue.js";
import { Enum } from "../utils/enum.js";
import { IEventManager } from "../types/common-interfaces.js";

export class EventManager implements IEventManager {
  #subscribers: Map<Enum, PriorityQueue<EventHandler<any>>>;
  #parent: Nullable<IEventManager>;

  constructor(parent?: IEventManager) {
    this.#subscribers = new Map();
    if (typeof parent !== "undefined") {
      this.#parent = parent;
    }
  }

  get parent(): Nullable<IEventManager> {
    return this.#parent;
  }

  on<T>(event: Enum, listener: EventHandler<T>, priority: number | PriorityLevel = PriorityLevel.None) {
    priority ??= PriorityLevel.None;
    if (!this.#subscribers.has(event)) {
      this.#subscribers.set(event, new PriorityQueue());
    }

    const priorityLevel = priority instanceof PriorityLevel ? priority.valueOf() : priority;
    this.#subscribers.get(event)!.add(listener, priorityLevel);
  }

  off<T>(event: Enum, listener: EventHandler<T>) {
    const queue = this.#subscribers.get(event);

    if (typeof queue === "undefined") {
      return;
    }

    return queue.remove(listener);
  }

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
