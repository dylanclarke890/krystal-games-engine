import { PriorityQueue } from "../utils/priority-queue.js";
import { IEventManager } from "../types/common-interfaces.js";
import { GameEventHandler, GameEventMap } from "../constants/events.js";

export class EventManager implements IEventManager {
  #subscribers: Map<Key<GameEventMap>, PriorityQueue<GameEventHandler<any>>>;
  #parent: Nullable<IEventManager>;

  constructor(parent?: IEventManager) {
    this.#parent = parent;
    this.#subscribers = new Map();
  }

  get parent(): Nullable<IEventManager> {
    return this.#parent;
  }

  on<T extends Key<GameEventMap>>(event: T, listener: GameEventHandler<T>, priority = 0) {
    if (!this.#subscribers.has(event)) {
      this.#subscribers.set(event, new PriorityQueue());
    }

    this.#subscribers.get(event)!.add(listener, priority);
  }

  off<T extends Key<GameEventMap>>(event: T, listener: GameEventHandler<T>) {
    const queue = this.#subscribers.get(event);
    return queue?.remove(listener);
  }

  trigger<T extends Key<GameEventMap>>(event: T, data: GameEventMap[T]) {
    const queue = this.#subscribers.get(event);
    queue?.forEach((listener) => listener(data));
    this.#parent?.trigger(event, data);
  }
}
