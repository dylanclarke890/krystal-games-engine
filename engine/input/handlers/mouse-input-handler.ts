import { Viewport } from "../../graphics/viewport.js";
import { Vector2 } from "../../maths/vector2.js";
import { InputActionStatus, InputStatus } from "../../types/common-types.js";
import { UserAgent } from "../../utils/user-agent.js";
import { InputKey } from "../input-keys.js";
import { BaseInputHandler } from "./base-input-handler.js";

export class MouseInputHandler extends BaseInputHandler {
  viewport: Viewport;
  mouse: Vector2;

  constructor(actions: Map<string, InputStatus>, bindings: Map<InputKey, string>, viewport: Viewport) {
    super(actions, bindings);
    this.viewport = viewport;
    this.mouse = new Vector2();
  }

  init() {
    if (this.hasInitialised) {
      return;
    }

    const canvas = this.viewport.canvas;
    canvas.addEventListener("wheel", this.onMouseWheel.bind(this), { passive: false }); // Stops Chrome warning
    canvas.addEventListener("contextmenu", this.onContextMenu.bind(this), false);
    canvas.addEventListener("mousedown", this.onMousedown.bind(this), false);
    canvas.addEventListener("mouseup", this.onMouseup.bind(this), false);
    canvas.addEventListener("mousemove", this.onMouseMove.bind(this), false);

    // TODO: replace use of UserAgent
    if (UserAgent.instance.device.touchDevice) {
      canvas.addEventListener("touchstart", this.onTouchStart.bind(this), false);
      canvas.addEventListener("touchend", this.onTouchEnd.bind(this), false);
      canvas.addEventListener("touchcancel", this.onTouchEnd.bind(this), false);
      canvas.addEventListener("touchmove", this.onMouseMove.bind(this), false);
    }
  }

  private getMouseActionState(e: MouseEvent): Nullable<InputActionStatus> {
    let key;
    switch (e.button) {
      case 0:
      case 1:
        key = InputKey.Mouse_BtnOne;
        break;
      case 2:
        key = InputKey.Mouse_BtnTwo;
        break;
      default:
        break;
    }

    if (typeof key === "undefined") {
      return undefined;
    }

    return super.getStateByInputKey(key);
  }

  private onMouseMove(e: TouchEvent | MouseEvent): void {
    const viewport = this.viewport;
    const internalWidth = viewport.canvas.offsetWidth || viewport.realWidth;
    const scale = viewport.scale * (internalWidth / viewport.realWidth);

    const pos = viewport.canvas.getBoundingClientRect();
    const { clientX, clientY } = "touches" in e ? e.touches[0] : e;
    this.mouse.x = (clientX - pos.left) / scale;
    this.mouse.y = (clientY - pos.top) / scale;
  }

  private onMousedown(e: MouseEvent): void {
    this.onMouseMove(e);

    const state = this.getMouseActionState(e);
    if (typeof state === "undefined") {
      return;
    }

    state.pressed = true;

    e.preventDefault();
    e.stopPropagation();
  }

  private onMouseup(e: MouseEvent): void {
    const state = this.getMouseActionState(e);
    if (typeof state === "undefined") {
      return;
    }

    state.released = true;

    e.preventDefault();
    e.stopPropagation();
  }

  private onTouchStart(e: TouchEvent): void {
    // Focus window element for mouse clicks. Prevents issues when running the game in an iframe.
    if (UserAgent.instance.device.mobile) {
      // TODO: replace use of UserAgent
      window.focus();
    }

    this.onMouseMove(e);

    const state = super.getStateByInputKey(InputKey.Touch_Start);
    if (typeof state === "undefined") {
      return;
    }

    state.pressed = true;
    e.preventDefault();
    e.stopPropagation();
  }

  private onTouchEnd(e: TouchEvent): void {
    const state = super.getStateByInputKey(InputKey.Touch_End);
    if (typeof state === "undefined") {
      return;
    }

    state.released = true;

    e.preventDefault();
    e.stopPropagation();
  }

  private onMouseWheel(e: WheelEvent): void {
    const scrollAmount = Math.sign(e.deltaY);
    const key = scrollAmount > 0 ? InputKey.Mouse_WheelDown : InputKey.Mouse_WheelUp;

    const state = super.getStateByInputKey(key);
    if (typeof state === "undefined") {
      return;
    }

    state.pressed = true;
    state.released = true;

    e.preventDefault();
    e.stopPropagation();
  }

  private onContextMenu(e: MouseEvent): void {
    if (this.bindings.has(InputKey.Context_Menu)) {
      e.preventDefault();
      e.stopPropagation();
    }
  }
}
