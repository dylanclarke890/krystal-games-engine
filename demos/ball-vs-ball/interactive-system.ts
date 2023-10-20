import { BaseComponent, CircleCollider, RectCollider, RigidBody } from "../../engine/components/index.js";
import { ShapeType } from "../../engine/constants/enums.js";
import { GameContext } from "../../engine/core/context.js";
import { InputKey } from "../../engine/input/input-keys.js";
import { isPointWithinCircle, isPointWithinRect } from "../../engine/physics/utils.js";
import { BaseSystem } from "../../engine/systems/base-system.js";
import { SystemGroup } from "../../engine/types/common-types.js";

export class InteractiveSystem extends BaseSystem {
  name: string = "shape-vs-shape";
  group: SystemGroup = "post-render";
  selectedEntity?: RigidBody;

  constructor(gameContext: GameContext, enabled?: boolean) {
    super(gameContext, enabled);
    this.gameContext.input.bind(InputKey.Mouse_BtnOne, "left-click");
    this.gameContext.input.bind(InputKey.Mouse_BtnTwo, "right-click");
  }

  isInterestedInComponent(component: BaseComponent): boolean {
    return component.name === "rigid-body";
  }

  belongsToSystem(entity: number): boolean {
    return this.gameContext.entities.hasComponent(entity, "rigid-body");
  }

  update(_dt: number, entities: Set<number>): void {
    const em = this.gameContext.entities;
    const mouse = this.gameContext.input.getMouseCoords();
    const leftClickState = this.gameContext.input.getState("left-click");
    const rightClickState = this.gameContext.input.getState("right-click");
    if (leftClickState.pressed || rightClickState.pressed) {
      this.selectedEntity = undefined;
      for (const id of entities) {
        const rigidBody = em.getComponent<RigidBody>(id, "rigid-body");

        if (typeof rigidBody === "undefined") {
          continue;
        }

        const collider = rigidBody.collider;
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
      const collider = this.selectedEntity.collider;
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

    if (rightClickState.released && typeof this.selectedEntity !== "undefined") {
      const velocity = this.selectedEntity.transform.position.clone().sub(mouse).mulScalar(5);
      this.selectedEntity.velocity.assign(velocity);
    }

    if (leftClickState.released || rightClickState.released) {
      this.selectedEntity = undefined;
    }

    const { width, height } = this.gameContext.viewport;
    for (const id of entities) {
      const rigidBody = em.getComponent<RigidBody>(id, "rigid-body");

      if (typeof rigidBody === "undefined") {
        continue;
      }

      if (rigidBody.transform.position.x < 0 || rigidBody.transform.position.x > width) {
        rigidBody.velocity.x *= -1;
      }

      if (rigidBody.transform.position.y < 0 || rigidBody.transform.position.y > height) {
        rigidBody.velocity.y *= -1;
      }

      const { x, y } = rigidBody.velocity;
      this.gameContext.viewport.drawText(
        `${x}, ${y}`,
        rigidBody.transform.position.x,
        rigidBody.transform.position.y - 30,
        undefined,
        "magenta"
      );
    }

    if (typeof this.selectedEntity !== "undefined") {
      const ctx = this.gameContext.viewport.ctx;
      const entityPos = this.selectedEntity.transform.position;
      ctx.strokeStyle = "orange";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(entityPos.x, entityPos.y);
      ctx.lineTo(mouse.x, mouse.y);
      ctx.stroke();
      ctx.lineWidth = 1;
    }
  }
}
