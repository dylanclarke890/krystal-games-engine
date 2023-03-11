import { InputKeys } from "./keys.js";

export class InputSystem {
  constructor() {
    this.mouse = { x: 0, y: 0 };
    this.keyBinds = {};
    this.pressed = {};
    this.#bindEvents();
  }

  #bindEvents() {
    document.addEventListener("keydown", (e) => this.onKeyDown(e));
    document.addEventListener("keyup", (e) => this.onKeyUp(e));
    // Buttons get stuck in the pressed position if the tab is changed while a key is pressed
    document.addEventListener("visibilitychange", () =>
      Object.keys(this.pressed).forEach((key) => (this.pressed[key] = false))
    );
  }

  onKeyDown(e) {
    console.log(e.key);
    const key = keyboardMap[e.key.toLowerCase()];
    this.pressed[key] = true;
  }

  onKeyUp(e) {
    const key = keyboardMap[e.key.toLowerCase()];
    this.pressed[key] = false;
  }

  contextMenu(e) {
    console.log(e);
  }

  getPressed() {
    return this.pressed;
  }
}

const keyboardMap = {
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
