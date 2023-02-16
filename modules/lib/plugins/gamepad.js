import { Game } from "../../core/game.js";
import { Input } from "../../core/input.js";
import { plugin } from "../plugin.js";
import { VendorAttributes } from "../vendor-attributes.js";

// Assign some values to the Gamepad buttons. We use an offset of 256 here so we don't collide with
// the keyboard buttons when binding.
const GAMEPAD_BUTTON_OFFSET = 256;
const GAMEPAD = {
  FACE_1: GAMEPAD_BUTTON_OFFSET + 0, // A
  FACE_2: GAMEPAD_BUTTON_OFFSET + 1, // Y
  FACE_3: GAMEPAD_BUTTON_OFFSET + 2, // B
  FACE_4: GAMEPAD_BUTTON_OFFSET + 3, // X
  LEFT_SHOULDER: GAMEPAD_BUTTON_OFFSET + 4,
  RIGHT_SHOULDER: GAMEPAD_BUTTON_OFFSET + 5,
  LEFT_SHOULDER_BOTTOM: GAMEPAD_BUTTON_OFFSET + 6,
  RIGHT_SHOULDER_BOTTOM: GAMEPAD_BUTTON_OFFSET + 7,
  SELECT: GAMEPAD_BUTTON_OFFSET + 8,
  START: GAMEPAD_BUTTON_OFFSET + 9,
  LEFT_ANALOGUE_STICK: GAMEPAD_BUTTON_OFFSET + 10,
  RIGHT_ANALOGUE_STICK: GAMEPAD_BUTTON_OFFSET + 11,
  PAD_TOP: GAMEPAD_BUTTON_OFFSET + 12,
  PAD_BOTTOM: GAMEPAD_BUTTON_OFFSET + 13,
  PAD_LEFT: GAMEPAD_BUTTON_OFFSET + 14,
  PAD_RIGHT: GAMEPAD_BUTTON_OFFSET + 15,
};

const inputOverrides = [
  {
    name: "gamepad",
    value: null,
  },
  {
    name: "lastButtons",
    value: {},
  },
  {
    name: "hasButtonObject",
    value: !!window.GamepadButton,
  },
  {
    name: "getFirstGamepadSnapshot",
    value: function () {
      const gamepads = navigator.getGamepads();
      for (let i = 0; i < gamepads.length; i++) if (gamepads[i]) return gamepads[i];
      return null;
    },
  },
  {
    name: "pollGamepad",
    value: function () {
      this.gamepad = this.getFirstGamepadSnapshot();
      if (!this.gamepad) return; // No gamepad snapshot

      // Iterate over all buttons, see if they're bound and check for their state
      for (let b = 0; b < this.gamepad.buttons.length; b++) {
        const action = this.bindings[b + GAMEPAD_BUTTON_OFFSET];
        let currentState = false;
        if (!action) {
          this.lastButtons[b] = currentState;
          return;
        }
        const button = this.gamepad.buttons[b];
        currentState =
          button.pressed != null
            ? button.pressed // W3C Standard
            : button; // Current Chrome version

        const prevState = this.lastButtons[b];

        // Was not pressed, but is now
        if (!prevState && currentState) {
          this.actions[action] = true;
          this.presses[action] = true;
        }
        // Was pressed, but is no more
        else if (prevState && !currentState) this.delayedKeyup[action] = true;
        this.lastButtons[b] = currentState;
      }
    },
  },
  {
    name: "GAMEPAD",
    value: GAMEPAD,
    isStatic: true,
  },
];

const gameOverrides = [
  {
    name: "update",
    value() {
      this.input.pollGamepad();
      this.parent();
    },
    needsBase: true,
  },
];

let gamepadsInitialised = false;
export function initGamepads() {
  VendorAttributes.normalize(navigator, "getGamepads");
  if (gamepadsInitialised) return;
  if (!navigator.getGamepads || !navigator.getGamepads()) return; // No Gamepad support; nothing to do here
  plugin(inputOverrides).to(Input);
  // Always poll gamepad before each frame
  plugin(gameOverrides).to(Game);
  gamepadsInitialised = true;
}
