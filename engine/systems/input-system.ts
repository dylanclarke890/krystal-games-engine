import { SystemTypes } from "../constants/enums.js";
import { InputManager } from "../managers/input-manager.js";
import { Assert } from "../utils/assert.js";
import { ComponentType } from "../types/common-types.js";
import { IEntityManager, IEventManager } from "../types/common-interfaces.js";
import { BaseSystem } from "./base-system.js";

export class InputSystem extends BaseSystem {
  static requiredComponents: ComponentType[] = ["Input"];
  static components: ComponentType[] = [...this.requiredComponents];
  static systemType = SystemTypes.Input;

  inputManager: InputManager;

  constructor(entityManager: IEntityManager, eventManager: IEventManager, inputManager: InputManager) {
    super(entityManager, eventManager);
    Assert.instanceOf("inputManager", inputManager, InputManager);
    this.inputManager = inputManager;
  }

  update(dt: number, entities: Set<number>) {
    const em = this.entityManager;
    this.inputManager.clearPressed();

    for (const id of entities) {
      const components = em.getComponents(id, InputSystem.components);
      if (typeof components.Input === "undefined") {
        continue;
      }

      for (const [action, { pressed, held, released }] of components.Input.actions) {
        const state = this.inputManager.state(action);
        if (state.pressed && typeof pressed === "function") pressed(id, em, dt);
        if (state.held && typeof held === "function") held(id, em, dt);
        if (state.released && typeof released === "function") released(id, em, dt);
      }
    }
  }
}
