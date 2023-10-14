export class TouchEventHandler {
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
