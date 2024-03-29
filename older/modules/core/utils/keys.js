import { Enum } from "../../lib/utils/enum.js";

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

  static Greater_Than = new InputKeys();
  static Less_Than = new InputKeys();
  static Comma = new InputKeys();
  static Period = new InputKeys();
  static Tilde = new InputKeys();
  static GraveAccent = new InputKeys();
  static Question = new InputKeys();
  static Exclamation = new InputKeys();
  static AtSign = new InputKeys();
  static Hash = new InputKeys();
  static Dollar = new InputKeys();
  static Percent = new InputKeys();
  static Caret = new InputKeys();
  static Pipe = new InputKeys();
  static Ampersand = new InputKeys();
  static Colon = new InputKeys();
  static Colon_Semi = new InputKeys();
  static Slash_Backward = new InputKeys();
  static Slash_Forward = new InputKeys();
  static Bracket_Round_Left = new InputKeys();
  static Bracket_Round_Right = new InputKeys();
  static Bracket_Square_Left = new InputKeys();
  static Bracket_Square_Right = new InputKeys();
  static Bracket_Curly_Left = new InputKeys();
  static Bracket_Curly_Right = new InputKeys();
  static Quote_Single = new InputKeys();
  static Quote_Double = new InputKeys();

  static Home = new InputKeys();
  static End = new InputKeys();
  static Page_Up = new InputKeys();
  static Page_Down = new InputKeys();
  static Pause = new InputKeys();
  // Doesn't have a keydown event but has keyup
  static PrintScreen = new InputKeys();
  static Insert = new InputKeys();
  static Delete = new InputKeys();

  static Multiply = new InputKeys();
  static Plus = new InputKeys();
  static Minus = new InputKeys();
  static UnderScore = new InputKeys();

  static Caps_Lock = new InputKeys();
  static Scroll_Lock = new InputKeys();
  static Num_Lock = new InputKeys();
  static Meta = new InputKeys();

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
  static Zero = new InputKeys();
  static One = new InputKeys();
  static Two = new InputKeys();
  static Three = new InputKeys();
  static Four = new InputKeys();
  static Five = new InputKeys();
  static Six = new InputKeys();
  static Seven = new InputKeys();
  static Eight = new InputKeys();
  static Nine = new InputKeys();

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

  static {
    this.freeze();
  }
}

/** @type {{[x:string]: InputKeys}} */
export const keyboardMap = {
  a: InputKeys.A,
  b: InputKeys.B,
  c: InputKeys.C,
  d: InputKeys.D,
  e: InputKeys.E,
  f: InputKeys.F,
  g: InputKeys.G,
  h: InputKeys.H,
  i: InputKeys.I,
  j: InputKeys.J,
  k: InputKeys.K,
  l: InputKeys.L,
  m: InputKeys.M,
  n: InputKeys.N,
  o: InputKeys.O,
  p: InputKeys.P,
  q: InputKeys.Q,
  r: InputKeys.R,
  s: InputKeys.S,
  t: InputKeys.T,
  u: InputKeys.U,
  v: InputKeys.V,
  w: InputKeys.W,
  x: InputKeys.X,
  y: InputKeys.Y,
  z: InputKeys.Z,
  0: InputKeys.Zero,
  1: InputKeys.One,
  2: InputKeys.Two,
  3: InputKeys.Three,
  4: InputKeys.Four,
  5: InputKeys.Five,
  6: InputKeys.Six,
  7: InputKeys.Seven,
  8: InputKeys.Eight,
  9: InputKeys.Nine,

  escape: InputKeys.Escape,
  backspace: InputKeys.BackSpace,
  " ": InputKeys.Space,
  enter: InputKeys.Enter,
  tab: InputKeys.Tab,
  shift: InputKeys.Shift,
  control: InputKeys.Ctrl,
  alt: InputKeys.Alt,

  ">": InputKeys.Greater_Than,
  "<": InputKeys.Less_Than,
  ",": InputKeys.Comma,
  ".": InputKeys.Period,
  "~": InputKeys.Tilde,
  "`": InputKeys.GraveAccent,
  ":": InputKeys.Colon,
  ";": InputKeys.Colon_Semi,
  "/": InputKeys.Slash_Backward,
  "\\": InputKeys.Slash_Forward,
  "(": InputKeys.Bracket_Round_Left,
  ")": InputKeys.Bracket_Round_Right,
  "[": InputKeys.Bracket_Square_Left,
  "]": InputKeys.Bracket_Square_Right,
  "{": InputKeys.Bracket_Curly_Left,
  "}": InputKeys.Bracket_Curly_Right,
  "?": InputKeys.Question,
  "!": InputKeys.Exclamation,
  "@": InputKeys.AtSign,
  "#": InputKeys.Hash,
  $: InputKeys.Dollar,
  "%": InputKeys.Percent,
  "^": InputKeys.Caret,
  "|": InputKeys.Pipe,
  "&": InputKeys.Ampersand,
  "'": InputKeys.Quote_Single,
  // eslint-disable-next-line quotes
  '"': InputKeys.Quote_Double,

  capslock: InputKeys.Caps_Lock,
  scrollock: InputKeys.Scroll_Lock,
  numlock: InputKeys.Num_Lock,
  meta: InputKeys.Meta,
  home: InputKeys.Home,
  end: InputKeys.End,
  pageup: InputKeys.Page_Up,
  pagedown: InputKeys.Page_Down,
  pause: InputKeys.Pause,
  // Doesn't have a keydown event but has keyup
  printscreen: InputKeys.PrintScreen,
  insert: InputKeys.Insert,
  delete: InputKeys.Delete,
  "*": InputKeys.Multiply,
  "+": InputKeys.Plus,
  "-": InputKeys.Minus,
  _: InputKeys.UnderScore,
  f1: InputKeys.F1,
  f2: InputKeys.F2,
  f3: InputKeys.F3,
  f4: InputKeys.F4,
  f5: InputKeys.F5,
  f6: InputKeys.F6,
  f7: InputKeys.F7,
  f8: InputKeys.F8,
  f9: InputKeys.F9,
  f10: InputKeys.F10,
  f11: InputKeys.F11,
  f12: InputKeys.F12,

  arrowleft: InputKeys.Arrow_Left,
  arrowup: InputKeys.Arrow_Up,
  arrowright: InputKeys.Arrow_Right,
  arrowdown: InputKeys.Arrow_Down,
};
