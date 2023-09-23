import { PriorityLevel } from "../constants/enums.js";
import { Enum } from "../utils/enum.js";

export interface IEventSystem {
  /** Get the parent EventSystem. */
  get parent(): IEventSystem | undefined;

  /** Subscribe to an event. */
  on<T>(event: Enum, listener: EventHandler<T>, priority?: number | PriorityLevel): void;

  /** Unsubscribe from an event. */
  off<T>(event: Enum, listener: EventHandler<T>): void;

  /** Trigger an event. */
  trigger<T>(event: Enum, data?: T): void;
}
