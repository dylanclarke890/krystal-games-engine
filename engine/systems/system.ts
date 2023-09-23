import { SystemTypes } from "../constants/enums.js";
import { EntityManager } from "../entities/entity-manager.js";
import { Assert } from "../utils/assert.js";
import { InvalidOperationError } from "../utils/errors.js";
import { ComponentType } from "../types/common-types.js";
import { IEventSystem } from "../types/common-interfaces.js";

export class System {
  static requiredComponents: ComponentType[];
  static systemType: SystemTypes;

  entityManager: EntityManager;
  eventSystem: IEventSystem;

  constructor(entityManager: EntityManager, eventSystem: IEventSystem) {
    Assert.instanceOf("entityManager", entityManager, EntityManager);
    this.entityManager = entityManager;
    this.eventSystem = eventSystem;
  }

  setup() {
    /* stub */
  }

  cleanup() {
    /* stub */
  }

  /**
   * @param _dt Delta time since last frame.
   * @param _entities Entities for the system to update.
   */
  update(_dt: number, _entities: Set<number>): void {
    throw new InvalidOperationError("Update method must be implemented.");
  }
}
