import { Enum } from "../utils/enum.js";

export class CollisionBehaviours extends Enum {
  static None = new CollisionBehaviours();
  static Fixed = new CollisionBehaviours();
  static Push = new CollisionBehaviours();
  static Separate = new CollisionBehaviours();

  static {
    this.freeze();
  }
}
