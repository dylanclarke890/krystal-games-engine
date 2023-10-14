import { Enum } from "../utils/enum.js";

export class InputKey extends Enum {
  //#region Mouse
  static Mouse_BtnOne = new InputKey();
  static Mouse_BtnTwo = new InputKey();
  static Context_Menu = new InputKey();
  static Mouse_WheelUp = new InputKey();
  static Mouse_WheelDown = new InputKey();
  static Mouse_Move = new InputKey();
  //#endregion Mouse
  //#region Touch Device
  static Touch_Start = new InputKey();
  static Touch_End = new InputKey();
  //#endregion Touch Device

  //#region Keyboard
  static Escape = new InputKey();
  static BackSpace = new InputKey();
  static Space = new InputKey();
  static Enter = new InputKey();
  static Tab = new InputKey();
  static Shift = new InputKey();
  static Shift_Left = new InputKey();
  static Shift_Right = new InputKey();
  static Ctrl = new InputKey();
  static Ctrl_Left = new InputKey();
  static Ctrl_Right = new InputKey();
  static Alt = new InputKey();
  static Alt_Left = new InputKey();
  static Alt_Right = new InputKey();

  static Greater_Than = new InputKey();
  static Less_Than = new InputKey();
  static Comma = new InputKey();
  static Period = new InputKey();
  static Tilde = new InputKey();
  static GraveAccent = new InputKey();
  static Question = new InputKey();
  static Exclamation = new InputKey();
  static AtSign = new InputKey();
  static Hash = new InputKey();
  static Dollar = new InputKey();
  static Percent = new InputKey();
  static Caret = new InputKey();
  static Pipe = new InputKey();
  static Ampersand = new InputKey();
  static Colon = new InputKey();
  static Colon_Semi = new InputKey();
  static Slash_Backward = new InputKey();
  static Slash_Forward = new InputKey();
  static Bracket_Round_Left = new InputKey();
  static Bracket_Round_Right = new InputKey();
  static Bracket_Square_Left = new InputKey();
  static Bracket_Square_Right = new InputKey();
  static Bracket_Curly_Left = new InputKey();
  static Bracket_Curly_Right = new InputKey();
  static Quote_Single = new InputKey();
  static Quote_Double = new InputKey();

  static Home = new InputKey();
  static End = new InputKey();
  static Page_Up = new InputKey();
  static Page_Down = new InputKey();
  static Pause = new InputKey();
  // Doesn't have a keydown event but has keyup
  static PrintScreen = new InputKey();
  static Insert = new InputKey();
  static Delete = new InputKey();

  static Multiply = new InputKey();
  static Plus = new InputKey();
  static Minus = new InputKey();
  static UnderScore = new InputKey();

  static Caps_Lock = new InputKey();
  static Scroll_Lock = new InputKey();
  static Num_Lock = new InputKey();
  static Meta = new InputKey();

  static Arrow_Left = new InputKey();
  static Arrow_Right = new InputKey();
  static Arrow_Up = new InputKey();
  static Arrow_Down = new InputKey();

  static A = new InputKey();
  static B = new InputKey();
  static C = new InputKey();
  static D = new InputKey();
  static E = new InputKey();
  static F = new InputKey();
  static G = new InputKey();
  static H = new InputKey();
  static I = new InputKey();
  static J = new InputKey();
  static K = new InputKey();
  static L = new InputKey();
  static M = new InputKey();
  static N = new InputKey();
  static O = new InputKey();
  static P = new InputKey();
  static Q = new InputKey();
  static R = new InputKey();
  static S = new InputKey();
  static T = new InputKey();
  static U = new InputKey();
  static V = new InputKey();
  static W = new InputKey();
  static X = new InputKey();
  static Y = new InputKey();
  static Z = new InputKey();
  static Zero = new InputKey();
  static One = new InputKey();
  static Two = new InputKey();
  static Three = new InputKey();
  static Four = new InputKey();
  static Five = new InputKey();
  static Six = new InputKey();
  static Seven = new InputKey();
  static Eight = new InputKey();
  static Nine = new InputKey();

  static F1 = new InputKey();
  static F2 = new InputKey();
  static F3 = new InputKey();
  static F4 = new InputKey();
  static F5 = new InputKey();
  static F6 = new InputKey();
  static F7 = new InputKey();
  static F8 = new InputKey();
  static F9 = new InputKey();
  static F10 = new InputKey();
  static F11 = new InputKey();
  static F12 = new InputKey();
  //#endregion Keyboard

  //#region Accelerometer
  static Device_Motion = new InputKey();
  //#endregion Accelerometer

  //#region Gamepad
  static Button_A = new InputKey();
  static Button_B = new InputKey();
  static Button_X = new InputKey();
  static Button_Y = new InputKey();
  static Button_LB = new InputKey();
  static Button_RB = new InputKey();
  static Button_LT = new InputKey();
  static Button_RT = new InputKey();
  static Button_Back = new InputKey();
  static Button_Start = new InputKey();

  static Stick_Left = new InputKey();
  static Stick_Right = new InputKey();

  static Dpad_Up = new InputKey();
  static Dpad_Down = new InputKey();
  static Dpad_Left = new InputKey();
  static Dpad_Right = new InputKey();

  static Axis_Left_X = new InputKey();
  static Axis_Left_Y = new InputKey();
  static Axis_Right_X = new InputKey();
  static Axis_Right_Y = new InputKey();
  static Axis_LT = new InputKey();
  static Axis_RT = new InputKey();
  //#endregion Gamepad

  static {
    this.freeze();
  }
}
