export class KeyboardInputHandler {
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