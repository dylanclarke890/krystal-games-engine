import { Enum } from "../lib/utils/enum.js";

export class InputKeys extends Enum {
  //#region Mouse
  static Mouse_BtnOne = new InputKeys();
  static Mouse_BtnTwo = new InputKeys();
  static Context_Menu = new InputKeys();
  static Mouse_WheelUp = new InputKeys();
  static Mouse_WheelDown = new InputKeys();
  static Mouse_Move = new InputKeys();
  //#endregion Mouse

  //#region Touch Device
  static Touch_Start = new InputKeys();
  static Touch_End = new InputKeys();
  static Touch_Move = new InputKeys();
  static Touch_Cancel = new InputKeys();
  //#endregion Touch Device

  //#region Keyboard
  static Escape = new InputKeys();
  static BackSpace = new InputKeys();
  static Space = new InputKeys();
  static Enter = new InputKeys();
  static Tab = new InputKeys();
  static Shift = new InputKeys();
  static Shift_Left = new InputKeys();
  static Shift_Right = new InputKeys();
  static Ctrl = new InputKeys();
  static Ctrl_Left = new InputKeys();
  static Ctrl_Right = new InputKeys();
  static Alt = new InputKeys();
  static Alt_Left = new InputKeys();
  static Alt_Right = new InputKeys();

  static Comma = new InputKeys();
  static Period = new InputKeys();
  static Tilde = new InputKeys();
  static Semicolon = new InputKeys();
  static Backslash = new InputKeys();
  static Bracket_Left = new InputKeys();
  static Bracket_Right = new InputKeys();
  static Quote = new InputKeys();

  static Home = new InputKeys();
  static End = new InputKeys();
  static Page_Up = new InputKeys();
  static Page_Down = new InputKeys();
  static Pause = new InputKeys();
  static PrintScreen = new InputKeys();
  static Insert = new InputKeys();
  static Delete = new InputKeys();

  static Multiply = new InputKeys();
  static Add = new InputKeys();
  static Subtract = new InputKeys();
  static Decimal = new InputKeys();
  static Divide = new InputKeys();
  static Plus = new InputKeys();
  static Minus = new InputKeys();

  static Caps_Lock = new InputKeys();
  static Scroll_Lock = new InputKeys();
  static Num_Lock = new InputKeys();

  static Arrow_Left = new InputKeys();
  static Arrow_Right = new InputKeys();
  static Arrow_Up = new InputKeys();
  static Arrow_Down = new InputKeys();

  static A = new InputKeys();
  static B = new InputKeys();
  static C = new InputKeys();
  static D = new InputKeys();
  static E = new InputKeys();
  static F = new InputKeys();
  static G = new InputKeys();
  static H = new InputKeys();
  static I = new InputKeys();
  static J = new InputKeys();
  static K = new InputKeys();
  static L = new InputKeys();
  static M = new InputKeys();
  static N = new InputKeys();
  static O = new InputKeys();
  static P = new InputKeys();
  static Q = new InputKeys();
  static R = new InputKeys();
  static S = new InputKeys();
  static T = new InputKeys();
  static U = new InputKeys();
  static V = new InputKeys();
  static W = new InputKeys();
  static X = new InputKeys();
  static Y = new InputKeys();
  static Z = new InputKeys();
  static One = new InputKeys();
  static Two = new InputKeys();
  static Three = new InputKeys();
  static Four = new InputKeys();
  static Five = new InputKeys();
  static Six = new InputKeys();
  static Seven = new InputKeys();
  static Eight = new InputKeys();
  static Nine = new InputKeys();
  static NumPad_One = new InputKeys();
  static NumPad_Two = new InputKeys();
  static NumPad_Three = new InputKeys();
  static NumPad_Four = new InputKeys();
  static NumPad_Five = new InputKeys();
  static NumPad_Six = new InputKeys();
  static NumPad_Seven = new InputKeys();
  static NumPad_Eight = new InputKeys();
  static NumPad_Nine = new InputKeys();
  static F1 = new InputKeys();
  static F2 = new InputKeys();
  static F3 = new InputKeys();
  static F4 = new InputKeys();
  static F5 = new InputKeys();
  static F6 = new InputKeys();
  static F7 = new InputKeys();
  static F8 = new InputKeys();
  static F9 = new InputKeys();
  static F10 = new InputKeys();
  static F11 = new InputKeys();
  static F12 = new InputKeys();
  //#endregion Keyboard

  //#region Accelerometer
  static Device_Motion = new InputKeys();
  static Device_Orientation = new InputKeys();
  //#endregion Accelerometer

  //#region Gamepad
  static Button_A = new InputKeys();
  static Button_B = new InputKeys();
  static Button_X = new InputKeys();
  static Button_Y = new InputKeys();
  static Button_LB = new InputKeys();
  static Button_RB = new InputKeys();
  static Button_LT = new InputKeys();
  static Button_RT = new InputKeys();
  static Button_Back = new InputKeys();
  static Button_Start = new InputKeys();

  static Stick_Left = new InputKeys();
  static Stick_Right = new InputKeys();

  static Dpad_Up = new InputKeys();
  static Dpad_Down = new InputKeys();
  static Dpad_Left = new InputKeys();
  static Dpad_Right = new InputKeys();

  static Axis_Left_X = new InputKeys();
  static Axis_Left_Y = new InputKeys();
  static Axis_Right_X = new InputKeys();
  static Axis_Right_Y = new InputKeys();
  static Axis_LT = new InputKeys();
  static Axis_RT = new InputKeys();
  //#endregion Gamepad
}

export class InputSystem {
  constructor() {
    this.mouse = { x: 0, y: 0 };
  }
}
