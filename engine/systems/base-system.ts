import { BaseComponent } from "../components/index.js";
import { GameContext } from "../core/context.js";
import { SystemType } from "../types/common-types.js";

export abstract class BaseSystem {
  /** The name of this system.*/
  abstract name: SystemType;
  /** Priority rating for order of execution when updating systems.*/
  abstract priority: number;
  /** Components that an entity should have for this system to process it. */
  /**
   * @param dt Delta time since last frame.
   * @param entities Entities for the system to update.
   */
  abstract update(dt: number, entities: Set<number>): void;
  abstract isInterestedInComponent(component: BaseComponent): boolean;
  abstract belongsToSystem(entity: number): boolean;

  context: GameContext;
  enabled: boolean;

  constructor(context: GameContext, enabled?: boolean) {
    this.context = context;
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
