import { Enum } from "../utils/enum.js";

export class EntityCollisionBehaviour extends Enum {
  static Elastic = new EntityCollisionBehaviour();
  static Inelastic = new EntityCollisionBehaviour();
  static OverlapResolution = new EntityCollisionBehaviour();
  static Trigger = new EntityCollisionBehaviour();
  static Custom = new EntityCollisionBehaviour();
  static Ignore = new EntityCollisionBehaviour();

  static {
    this.freeze();
  }
}
