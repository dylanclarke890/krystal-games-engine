import { Enum } from "../lib/utils/enum.js";

export class GameEvents extends Enum {
  //region Input
  static MouseMove = new GameEvents();
  static WindowResized = new GameEvents();
  static KeyPressed = new GameEvents();
  //endregion Input

  static GameInitialised = new GameEvents();
  static NextFrame = new GameEvents();

  static {
    this.freeze();
  }
}
