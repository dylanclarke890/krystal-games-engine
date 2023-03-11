import { InputSystem } from "./modules/core/input-system.js";

const system = new InputSystem();
const list = document.querySelector("#keys-pressed");
setInterval(checkForInputs, 16);

function checkForInputs() {
  list.innerHTML = "";
}
