import { BaseComponent, CircleCollider, RigidBody } from "../../engine/components/index.js";
import { GameContext } from "../../engine/core/context.js";
import { isPointWithinCircle } from "../../engine/physics/utils.js";
import { BaseSystem } from "../../engine/systems/base-system.js";
import { SystemType } from "../../engine/types/common-types.js";

export class InteractiveSystem extends BaseSystem {
  name: SystemType = "custom";
  priority: number = 20;
  selectedEntity?: RigidBody;

  constructor(gameContext: GameContext, enabled?: boolean) {
    super(gameContext, enabled);
  }

  isInterestedInComponent(component: BaseComponent): boolean {
    return component.type === "rigid-body";
  }

  belongsToSystem(entity: number): boolean {
    return this.gameContext.entities.hasComponent(entity, "rigid-body");
  }

  update(_dt: number, entities: Set<number>): void {
    const em = this.gameContext.entities;
    const mouse = this.gameContext.input.mouse;
    const leftClickState = this.gameContext.input.getLeftClickState();
    if (leftClickState.pressed) {
      console.log("click pressed");
      this.selectedEntity = undefined;
      for (const id of entities) {
        const rigidBody = em.getComponent(id, "rigid-body");

        if (typeof rigidBody === "undefined") {
          continue;
        }

        if (isPointWithinCircle(mouse, rigidBody.colliders[0] as CircleCollider)) {
          this.selectedEntity = rigidBody;
        }
      }
    }

    if (leftClickState.held) {
      console.log("click held");
      this.selectedEntity?.transform.position.assign(mouse);
    }

    if (leftClickState.released) {
      console.log("click released");
      this.selectedEntity = undefined;
    }

    const arrowLeft = this.gameContext.input.getState("left");
    if (arrowLeft.pressed) {
      console.log("arrowLeft pressed");
    }

    if (arrowLeft.held) {
      console.log("arrowLeft held");
    }

    if (arrowLeft.released) {
      console.log("arrowLeft released");
    }
  }
}
