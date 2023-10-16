import { BaseComponent } from "../../engine/components/base.js";
import { GameContext } from "../../engine/core/context.js";
import { PhysicsContext } from "../../engine/physics/context.js";
import { BaseSystem } from "../../engine/systems/base-system.js";
import { SystemGroup } from "../../engine/types/common-types.js";

export class CollisionInfoSystem extends BaseSystem {
  name: string = "collision-info";
  group: SystemGroup = "custom";
  physicsContext: PhysicsContext;

  constructor(gameContext: GameContext, physicsContext: PhysicsContext) {
    super(gameContext);
    this.physicsContext = physicsContext;
  }

  update(_dt: number, _entities: Set<number>): void {
    const entityCount = this.gameContext.entities.entities.size;
    const { broadphase, detector, resolver } = this.physicsContext;
    const font = "Arial 20px";
    const color = "yellow";

    this.physicsContext.broadphase.draw("green");

    const stats = [
      `Total entities: ${entityCount}`,
      `N² collisions: ${entityCount * entityCount}`,
      `Broadphase checked: ${broadphase.totalPotential}`,
      `Broadphase found: ${broadphase.totalFound}`,
      `Detector checked: ${detector.totalPotential}`,
      `Detector found: ${detector.totalFound}`,
      `Collisions resolved: ${resolver.totalResolved}`,
    ];
    stats.forEach((msg, i) => {
      this.gameContext.viewport.drawText(msg, 20, (i + 1) * 20, font, color);
    });
  }

  isInterestedInComponent(_component: BaseComponent): boolean {
    return false;
  }

  belongsToSystem(_entity: number): boolean {
    return false;
  }
}
