export class AccelerometerEventHandler {
  hasInitialised;

  constructor() {
    this.hasInitialised = false;
  }

  init() {
    if (this.hasInitialised) {
      return;
    }
  }
}
