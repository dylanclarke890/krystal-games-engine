import { InputManager } from "../input/input-manager.js";
import { SystemTypes } from "./system-types.js";
import { System } from "./system.js";
import { EntityManager } from "../entities/entity-manager.js";
import { Assert } from "../utils/assert.js";
import { ComponentType } from "../utils/types.js";

export class InputSystem extends System {
  static requiredComponents: ComponentType[] = ["Input"];
  static components: ComponentType[] = [...this.requiredComponents];
  static systemType = SystemTypes.Input;

  inputManager: InputManager;

  constructor(entityManager: EntityManager, inputManager: InputManager) {
    super(entityManager);
    Assert.instanceOf("inputManager", inputManager, InputManager);
    this.inputManager = inputManager;
  }

  update(dt: number, entities: number[]) {
    const em = this.entityManager;
    this.inputManager.clearPressed();

    for (const id of entities) {
      const entity = em.getComponents(id, InputSystem.components);
      if (typeof entity.Input === "undefined") {
        continue;
      }

      for (const [action, { pressed, held, released }] of entity.Input.actions) {
        const state = this.inputManager.state(action);
        if (state.pressed && typeof pressed === "function") pressed(id, em, dt);
        if (state.held && typeof held === "function") held(id, em, dt);
        if (state.released && typeof released === "function") released(id, em, dt);
      }
    }
  }
}
