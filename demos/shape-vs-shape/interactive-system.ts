import { BaseComponent, CircleCollider, RectCollider, RigidBody } from "../../engine/components/index.js";
import { ShapeType } from "../../engine/constants/enums.js";
import { GameContext } from "../../engine/core/context.js";
import { InputKey } from "../../engine/input/input-keys.js";
import { isPointWithinCircle, isPointWithinRect } from "../../engine/physics/utils.js";
import { BaseSystem } from "../../engine/systems/base-system.js";
import { SystemType } from "../../engine/types/common-types.js";

export class ShapeVsShapeSystem extends BaseSystem {
  name: SystemType = "custom";
  priority: number = 8;
  selectedEntity?: RigidBody;

  constructor(gameContext: GameContext, enabled?: boolean) {
    super(gameContext, enabled);
    this.gameContext.input.bind(InputKey.Mouse_BtnOne, "left-click");
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

        const collider = rigidBody.colliders[0];
        collider.computeAABB();
        switch (collider.shapeType) {
          case ShapeType.Circle:
            if (isPointWithinCircle(mouse, collider as CircleCollider)) {
              this.selectedEntity = rigidBody;
            }
            break;
          case ShapeType.Rectangle:
            if (isPointWithinRect(mouse, collider as RectCollider)) {
              this.selectedEntity = rigidBody;
            }
            break;
          case ShapeType.Polygon:
          default:
            break;
        }
      }
    }

    if (leftClickState.held && typeof this.selectedEntity !== "undefined") {
      const collider = this.selectedEntity.colliders[0];
      switch (collider.shapeType) {
        case ShapeType.Circle:
          collider.setAbsolutePosition(mouse);
          break;
        case ShapeType.Rectangle:
          collider.setAbsolutePosition(mouse.sub((collider as RectCollider).size.clone().divScalar(2)));
          break;
        case ShapeType.Polygon:
        default:
          break;
      }
    }

    if (leftClickState.released) {
      this.selectedEntity = undefined;
    }
  }
}
