import { BaseComponent } from "../../engine/components/base.js";
import { GameContext } from "../../engine/core/context.js";
import { PhysicsContext } from "../../engine/physics/context.js";
import { BaseSystem } from "../../engine/systems/base-system.js";
import { SystemType } from "../../engine/types/common-types.js";

export class CollisionInfoSystem extends BaseSystem {
  name: SystemType = "custom";
  priority: number = 30;
  physicsContext: PhysicsContext;

  constructor(gameContext: GameContext, physicsContext: PhysicsContext) {
    super(gameContext);
    this.physicsContext = physicsContext;
  }

  update(_dt: number, entities: Set<number>): void {
    const { collisionsChecked, collisionsFound } = this.physicsContext.detector;
    this.gameContext.viewport.drawText(`Total entities:           ${entities.size}`, 20, 20, undefined, "purple");
    this.gameContext.viewport.drawText(`Total collisions checked: ${collisionsChecked}`, 20, 40, undefined, "purple");
    this.gameContext.viewport.drawText(`Total entities found:     ${collisionsFound}`, 20, 60, undefined, "purple");
  }

  isInterestedInComponent(_component: BaseComponent): boolean {
    return false;
  }

  belongsToSystem(_entity: number): boolean {
    return false;
  }
}
