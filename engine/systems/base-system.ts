import { SystemTypes } from "../constants/enums.js";
import { ComponentType } from "../types/common-types.js";
import { IEntityManager, IEventManager } from "../types/common-interfaces.js";

export abstract class BaseSystem {
  static requiredComponents: ComponentType[];
  static systemType: SystemTypes;

  entityManager: IEntityManager;
  eventManager: IEventManager;

  constructor(entityManager: IEntityManager, eventManager: IEventManager) {
    this.entityManager = entityManager;
    this.eventManager = eventManager;
  }

  /**
   * @param dt Delta time since last frame.
   * @param entities Entities for the system to update.
   */
  abstract update(dt: number, entities: Set<number>): void;
}
