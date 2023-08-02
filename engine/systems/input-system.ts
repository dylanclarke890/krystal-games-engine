import { InputManager } from "../input/input-manager.js";
import { SystemTypes } from "./system-types.js";
import { System } from "./system.js";
import { EntityManager } from "../entities/entity-manager.js";
import { Assert } from "../utils/assert.js";
import { ComponentType } from "../utils/types.js";

export class InputSystem extends System {
  static requiredComponents: ComponentType[] = ["Input"];
  static systemType = SystemTypes.Input;

  inputManager: InputManager;

  constructor(entityManager: EntityManager, inputManager: InputManager) {
    super(entityManager);
    Assert.instanceOf("inputManager", inputManager, InputManager);
    this.inputManager = inputManager;
  }

  update(dt: number) {
    const em = this.entityManager;
    const entities = em.getEntitiesWithComponents(...InputSystem.requiredComponents);
    for (const entity of entities) {
      const input = em.getComponent(entity, "Input")!;
      for (const [action, { pressed, held, released }] of input.actions) {
        const state = this.inputManager.state(action);
        if (state.pressed && typeof pressed === "function") pressed(entity, em, dt);
        if (state.held && typeof held === "function") held(entity, em, dt);
        if (state.released && typeof released === "function") released(entity, em, dt);
      }
    }
    this.inputManager.clearPressed();
  }
}
