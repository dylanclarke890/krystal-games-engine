import { SystemTypes } from "../constants/enums.js";
import { EntityManager } from "../entities/entity-manager.js";
import { EventSystem } from "../events/event-system.js";
import { Assert } from "../utils/assert.js";
import { InvalidOperationError } from "../utils/errors.js";
import { ComponentType } from "../types/common-types.js";

export class System {
  static requiredComponents: ComponentType[];
  static systemType: SystemTypes;

  entityManager: EntityManager;
  eventSystem: EventSystem;

  constructor(entityManager: EntityManager, eventSystem: EventSystem) {
    Assert.instanceOf("entityManager", entityManager, EntityManager);
    Assert.instanceOf("eventSystem", eventSystem, EventSystem);
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
