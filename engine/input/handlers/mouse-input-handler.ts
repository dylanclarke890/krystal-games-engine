export class MouseInputHandler {
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
