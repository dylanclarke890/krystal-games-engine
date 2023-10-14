export class KeyboardEventHandler {
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
