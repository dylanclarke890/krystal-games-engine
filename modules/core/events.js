import { Enum } from "../lib/utils/enum.js";

export class GameEvents extends Enum {
  //#region System (1 - 10)
  static System_ReadyToLoad = new GameEvents();
  static System_PreloadingAssets = new GameEvents();
  static System_PreloadingComplete = new GameEvents();
  //#endregion System (1 - 10)

  //region Loop (11 - 20)
  static Loop_Start = new GameEvents();
  static Loop_NextFrame = new GameEvents();
  static Loop_Pause = new GameEvents();
  static Loop_Stop = new GameEvents();
  static Loop_Restart = new GameEvents();
  //endregion Loop (11 - 20)

  //region Input (21 - 40)
  static Mouse_Down = new GameEvents();
  static Mouse_Move = new GameEvents();
  static Mouse_Up = new GameEvents();
  static Mouse_Click = new GameEvents();
  static Window_Resized = new GameEvents();
  //endregion Input (21 - 40)

  //region Sound (41 - 50)
  static Sound_UnlockWebAudio = new GameEvents();
  //endregion Sound (41 - 50)

  static {
    this.freeze();
  }
}
