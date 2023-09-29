import { SystemTypes } from "../constants/enums.js";
import { InvalidOperationError } from "../types/errors.js";
import { ComponentType } from "../types/common-types.js";
import { IEntityManager, IEventSystem } from "../types/common-interfaces.js";

export class BaseSystem {
  static requiredComponents: ComponentType[];
  static systemType: SystemTypes;

  entityManager: IEntityManager;
  eventSystem: IEventSystem;

  constructor(entityManager: IEntityManager, eventSystem: IEventSystem) {
    this.entityManager = entityManager;
    this.eventSystem = eventSystem;
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
