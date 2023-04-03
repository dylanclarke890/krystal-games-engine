import { Enum } from "../utils/enum.js";

export class EntityCollisionBehaviour extends Enum {
  static None = new EntityCollisionBehaviour();
  static Fixed = new EntityCollisionBehaviour();
  static Push = new EntityCollisionBehaviour();
  static Separate = new EntityCollisionBehaviour();

  static {
    this.freeze();
  }
}
