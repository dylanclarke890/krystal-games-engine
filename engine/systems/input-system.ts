import { InputManager } from "../managers/input-manager.js";
import { Assert } from "../utils/assert.js";
import { IEntityManager, IEventManager } from "../types/common-interfaces.js";
import { BaseSystem } from "./base-system.js";
import { BaseComponent } from "../components/base.js";
import { Input } from "../components/input.js";

export class InputSystem extends BaseSystem {
  name: string = "InputSystem";
  requiredComponents: string[] = ["Input"];
  components: string[] = [...this.requiredComponents];
  priority: number = 0;
  inputManager: InputManager;

  constructor(entityManager: IEntityManager, eventManager: IEventManager, inputManager: InputManager) {
    super(entityManager, eventManager);
    Assert.instanceOf("inputManager", inputManager, InputManager);
    this.inputManager = inputManager;
  }

  isInterestedInComponent(component: BaseComponent): boolean {
    if (component.type === "Input") return true;
    return false;
  }

  belongsToSystem(entity: number): boolean {
    return typeof this.entityManager.getComponents(entity, this.requiredComponents).Input !== "undefined";
  }

  update(dt: number, entities: Set<number>) {
    const em = this.entityManager;
    this.inputManager.clearPressed();

    for (const id of entities) {
      const components = em.getComponents(id, this.components);
      if (typeof components.Input === "undefined") {
        continue;
      }

      for (const [action, { pressed, held, released }] of (components.Input as Input).actions) {
        const state = this.inputManager.state(action);
        if (state.pressed && typeof pressed === "function") pressed(id, em, dt);
        if (state.held && typeof held === "function") held(id, em, dt);
        if (state.released && typeof released === "function") released(id, em, dt);
      }
    }
  }
}
