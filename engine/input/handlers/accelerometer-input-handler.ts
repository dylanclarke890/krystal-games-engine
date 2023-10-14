import { Vector3 } from "../../maths/vector3.js";

export class AccelerometerInputHandler {
  hasInitialised;

  acceleration: Vector3;
  accelerationIncludingGravity: Vector3;

  constructor() {
    this.hasInitialised = false;
    this.acceleration = new Vector3();
    this.accelerationIncludingGravity = new Vector3();
  }

  init() {
    if (this.hasInitialised) {
      return;
    }

    this.hasInitialised = true;
    window.addEventListener("devicemotion", this.#onDeviceMotion.bind(this));
  }

  #onDeviceMotion(e: DeviceMotionEvent): void {
    if (e.accelerationIncludingGravity !== null) {
      this.accelerationIncludingGravity.x = e.accelerationIncludingGravity.x ?? 0;
      this.accelerationIncludingGravity.y = e.accelerationIncludingGravity.y ?? 0;
      this.accelerationIncludingGravity.z = e.accelerationIncludingGravity.z ?? 0;
    }

    if (e.acceleration !== null) {
      this.acceleration.x = e.acceleration.x ?? 0;
      this.acceleration.y = e.acceleration.y ?? 0;
      this.acceleration.z = e.acceleration.z ?? 0;
    }
  }
}
