import { InputManager } from "../input/input-manager.js";
import { Guard } from "../utils/guard.js";
import { System } from "./system.js";

export class InputSystem extends System {
  static requiredComponents = ["InputComponent"];

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
      const inputComponent = this.entityManager.getComponent(entity, "InputComponent");
      for (const action in inputComponent.bindings) {
        const key = inputComponent.bindings[action];
        console.log(key);
      }
    }
    this.inputManager.clearPressed();
  }
}
