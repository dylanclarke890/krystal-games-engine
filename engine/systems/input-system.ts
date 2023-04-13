import { InputManager } from "../input/input-manager.js";
import { SystemTypes } from "./system-types.js";
import { RequiredComponent, System } from "./system.js";
import { EntityManager } from "../entities/entity-manager.js";
import { Assert } from "../utils/assert.js";

export class InputSystem extends System {
  static requiredComponents: RequiredComponent[] = ["Input"];
  static systemType = SystemTypes.Input;

  inputManager: InputManager;

  constructor(entityManager: EntityManager, inputManager: InputManager) {
    super(entityManager);
    Assert.instanceOf("inputManager", inputManager, InputManager);
    this.inputManager = inputManager;
  }

  update() {
    const entities = this.entityManager.getEntitiesWithComponents(
      ...InputSystem.requiredComponents
    );
    for (const entity of entities) {
      const input = this.entityManager.getComponent(entity, "Input")!;
      for (const [action, fn] of input.bindings) {
        if (this.inputManager.released(action)) fn();
      }
    }
    this.inputManager.clearPressed();
  }
}
