import { PriorityLevel } from "../constants/enums.js";
import { PriorityQueue } from "../utils/priority-queue.js";
import { IEventManager } from "../types/common-interfaces.js";
import { GameEventHandler, GameEventMap } from "../constants/events.js";

export class EventManager implements IEventManager {
  #subscribers: Map<Key<GameEventMap>, PriorityQueue<GameEventHandler<any>>>;
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

  on<T extends Key<GameEventMap>>(
    event: T,
    listener: GameEventHandler<T>,
    priority: number | PriorityLevel = PriorityLevel.None
  ) {
    priority ??= PriorityLevel.None;
    if (!this.#subscribers.has(event)) {
      this.#subscribers.set(event, new PriorityQueue());
    }

    const priorityLevel = priority instanceof PriorityLevel ? priority.valueOf() : priority;
    this.#subscribers.get(event)!.add(listener, priorityLevel);
  }

  off<T extends Key<GameEventMap>>(event: T, listener: GameEventHandler<T>) {
    const queue = this.#subscribers.get(event);

    if (typeof queue === "undefined") {
      return;
    }

    return queue.remove(listener);
  }

  trigger<T extends Key<GameEventMap>>(event: T, data?: GameEventMap[T]) {
    const queue = this.#subscribers.get(event);

    if (typeof queue !== "undefined") {
      queue.forEach((listener) => listener(data));
    }

    if (typeof this.#parent !== "undefined") {
      this.#parent.trigger(event, data);
    }
  }
}
