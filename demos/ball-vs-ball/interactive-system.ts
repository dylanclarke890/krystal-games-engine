import { BaseComponent, CircleCollider, RigidBody } from "../../engine/components/index.js";
import { GameEventType } from "../../engine/constants/events.js";
import { GameContext } from "../../engine/core/context.js";
import { InputKey } from "../../engine/input/input-keys.js";
import { isPointWithinCircle } from "../../engine/physics/utils.js";
import { BaseSystem } from "../../engine/systems/base-system.js";
import { SystemType } from "../../engine/types/common-types.js";

export class InteractiveSystem extends BaseSystem {
  name: SystemType = "custom";
  priority: number = 8;
  selectedEntity?: RigidBody;

  constructor(gameContext: GameContext, enabled?: boolean) {
    super(gameContext, enabled);
    this.gameContext.input.bind(InputKey.Mouse_BtnOne, "left-click");
    this.gameContext.events.on(GameEventType.ENTITY_COLLIDED, (data) => {
      console.log({ ...data });
    });
  }

  isInterestedInComponent(component: BaseComponent): boolean {
    return component.type === "rigid-body";
  }

  belongsToSystem(entity: number): boolean {
    return this.gameContext.entities.hasComponent(entity, "rigid-body");
  }

  update(_dt: number, entities: Set<number>): void {
    const em = this.gameContext.entities;
    const mouse = this.gameContext.input.getMouseCoords();
    const leftClickState = this.gameContext.input.getState("left-click");
    if (leftClickState.pressed) {
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
      this.selectedEntity?.transform.position.assign(mouse);
    }

    if (leftClickState.released) {
      this.selectedEntity = undefined;
    }
  }
}
