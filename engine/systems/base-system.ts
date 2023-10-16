import { BaseComponent } from "../components/index.js";
import { GameContext } from "../core/context.js";
import { SystemGroup } from "../types/common-types.js";

export abstract class BaseSystem {
  /** The name of this system.*/
  abstract name: string;
  /** The group this system belongs to. Systems in the "custom" group will run after all other systems.*/
  abstract group: SystemGroup;
  /** Priority rating for order of execution when updating system groups.*/
  priority: number = 0;

  abstract isInterestedInComponent(component: BaseComponent): boolean;
  abstract belongsToSystem(entity: number): boolean;

  /**
   * @param dt Delta time since last frame.
   * @param entities Entities for the system to update.
   */
  abstract update(dt: number, entities: Set<number>): void;

  gameContext: GameContext;
  enabled: boolean;

  constructor(gameContext: GameContext, enabled?: boolean) {
    this.gameContext = gameContext;
    this.enabled = enabled ?? true;
  }

  init(): void {
    /* Stub */
  }

  cleanup(): void {
    /* Stub */
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }
}
