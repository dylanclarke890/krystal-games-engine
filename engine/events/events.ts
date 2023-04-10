import { Enum } from "../utils/enum";

export class GameEvents extends Enum {
  //#region System
  static System_ReadyToLoad = new GameEvents();
  static System_PreloadingAssets = new GameEvents();
  static System_PreloadingComplete = new GameEvents();
  //#endregion System

  //region Entity
  static Entity_Created = new GameEvents();
  static Entity_Destroyed = new GameEvents();
  static Entity_Collided = new GameEvents();
  //endregion Entity

  //region Loop
  static Loop_BeforeStart = new GameEvents();
  static Loop_Start = new GameEvents();
  static Loop_NextFrame = new GameEvents();
  static Loop_Pause = new GameEvents();
  static Loop_Stop = new GameEvents();
  static Loop_Restart = new GameEvents();
  //endregion Loop

  //region Input
  static Mouse_Down = new GameEvents();
  static Mouse_Move = new GameEvents();
  static Mouse_Up = new GameEvents();
  static Mouse_Click = new GameEvents();
  static Window_Resized = new GameEvents();
  //endregion Input

  //region Sound
  static Sound_UnlockWebAudio = new GameEvents();
  static Sound_Played = new GameEvents();
  static Sound_Paused = new GameEvents();
  static Sound_Stopped = new GameEvents();
  static Sound_Looped = new GameEvents();
  //endregion Sound

  static {
    this.freeze();
  }
}
