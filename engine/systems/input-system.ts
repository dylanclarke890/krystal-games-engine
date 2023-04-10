import { InputManager } from "../input/input-manager";
import { Guard } from "../utils/guard";
import { SystemTypes } from "./system-types";
import { System } from "./system";
import { EntityManager } from "../entities/entity-manager";
import { Input } from "../components/input";

export class InputSystem extends System {
  static requiredComponents = ["Input"];
  static systemType = SystemTypes.Input;

  inputManager: InputManager;

  constructor(entityManager: EntityManager, inputManager: InputManager) {
    super(entityManager);
    Guard.againstNull({ inputManager }).isInstanceOf(InputManager);
    this.inputManager = inputManager;
  }

  update() {
    const entities = this.entityManager.getEntitiesWithComponents(
      ...InputSystem.requiredComponents
    );
    for (const entity of entities) {
      const input = this.entityManager.getComponent(entity, "Input");
      for (const [action, fn] of (input as Input).bindings) {
        if (this.inputManager.released(action)) fn();
      }
    }
    this.inputManager.clearPressed();
  }
}
