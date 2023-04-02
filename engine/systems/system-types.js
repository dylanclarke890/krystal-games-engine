import { Enum } from "../utils/enum.js";

export class SystemTypes extends Enum {
  static Graphics = new SystemTypes();
  static Physics = new SystemTypes();
  static Position = new SystemTypes();
  static Input = new SystemTypes();
  static Collision = new SystemTypes();

  static {
    this.freeze();
  }
}
