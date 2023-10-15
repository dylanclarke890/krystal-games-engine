import { Enum } from "../utils/enum.js";

export class PriorityLevel extends Enum {
  /**
   * Used by core functionality, it is not recommended to have events with higher priority
   * levels than Critical unless you know what you're doing.
   */
  static Critical = new PriorityLevel(1024);
  static High = new PriorityLevel(768);
  static Med = new PriorityLevel(512);
  static Low = new PriorityLevel(256);
  static None = new PriorityLevel(0);

  static {
    this.freeze();
  }
}



export class CollisionResponseType extends Enum {
  /** No response, just notifies */
  static None = new CollisionResponseType();
  /** Has a physical response (e.g. bounce back) */
  static Physical = new CollisionResponseType();
  /** Triggers some event/script but doesn't move */
  static Event = new CollisionResponseType();
}

export enum ShapeType {
  Circle = "Circle",
  Rectangle = "Rectangle",
  Polygon = "Polygon",
}
