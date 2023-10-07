import { BaseComponent } from "../components/base.js";
import { IEntityManager, IEventManager } from "../types/common-interfaces.js";

export abstract class BaseSystem {
  /** The name of this system.*/
  abstract name: string;
  /** Priority rating for order of execution when updating systems.*/
  abstract priority: number;
  /** Components that an entity should have for this system to process it. */
  abstract requiredComponents: string[];
  /**
   * @param dt Delta time since last frame.
   * @param entities Entities for the system to update.
   */
  abstract update(dt: number, entities: Set<number>): void;
  abstract isInterestedInComponent(component: BaseComponent): boolean;
  abstract belongsToSystem(entity: number): boolean;

  entityManager: IEntityManager;
  eventManager: IEventManager;
  enabled: boolean;

  constructor(entityManager: IEntityManager, eventManager: IEventManager, enabled?: boolean) {
    this.entityManager = entityManager;
    this.eventManager = eventManager;
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
