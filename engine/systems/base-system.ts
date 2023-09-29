import { SystemTypes } from "../constants/enums.js";
import { InvalidOperationError } from "../types/errors.js";
import { ComponentType } from "../types/common-types.js";
import { IEntityManager, IEventManager } from "../types/common-interfaces.js";

export class BaseSystem {
  static requiredComponents: ComponentType[];
  static systemType: SystemTypes;

  entityManager: IEntityManager;
  eventManager: IEventManager;

  constructor(entityManager: IEntityManager, eventManager: IEventManager) {
    this.entityManager = entityManager;
    this.eventManager = eventManager;
  }

  setup() {
    /* stub */
  }

  /**
   * @param _dt Delta time since last frame.
   * @param _entities Entities for the system to update.
   */
  update(_dt: number, _entities: Set<number>): void {
    throw new InvalidOperationError("Update method must be implemented.");
  }

  cleanup() {
    /* stub */
  }
}
