import { InputSystem } from "./modules/core/input/input-system.js";

const system = new InputSystem();
const display = document.querySelector("#keys-pressed");
setInterval(checkForInputs, 16);

function checkForInputs() {
  display.innerHTML = "";
  const pressed = system.getPressed();
  display.innerHTML = JSON.stringify(pressed);
}
