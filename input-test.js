import { InputManager } from "./modules/core/input/input-system.js";

const system = new InputManager({ canvas: document.querySelector("canvas") });
const display = document.querySelector("#keys-pressed");
setInterval(checkForInputs, 16);

function checkForInputs() {
  display.innerHTML = "";
  const pressed = system.getPressed();
  display.innerHTML = JSON.stringify(pressed);
}
