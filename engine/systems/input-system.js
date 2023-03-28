import { InputManager } from "../input/input-manager.js";
import { Guard } from "../utils/guard.js";
import { SystemTypes } from "./system-types.js";
import { System } from "./system.js";

export class InputSystem extends System {
  static requiredComponents = ["InputComponent"];
  static systemType = SystemTypes.Input;

  /** @type {InputManager} */
  inputManager;

  constructor(entityManager, inputManager) {
    super(entityManager);
    Guard.againstNull({ inputManager }).isInstanceOf(InputManager);
    this.inputManager = inputManager;
  }

  update() {
    const entities = this.entityManager.getEntitiesWithComponents(
      ...InputSystem.requiredComponents
    );
    for (const entity of entities) {
      /** @type {{bindings: Map}} */
      const inputComponent = this.entityManager.getComponent(entity, "InputComponent");
      for (const [key, value] of inputComponent.bindings) {
        console.log(`The value for key ${key} is ${value}`);
      }
    }
    this.inputManager.clearPressed();
  }
}
