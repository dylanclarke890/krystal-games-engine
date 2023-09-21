import { EntityManager } from "../entities/entity-manager.js";
import { EventSystem } from "../events/event-system.js";
import { Assert } from "../utils/assert.js";
import { ComponentType } from "../utils/types.js";
import { SystemTypes } from "./system-types.js";

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

  /**
   * @param _dt Delta time since last frame.
   * @param _entities Entities for the system to update.
   */
  update(_dt: number, _entities: number[]): void {
    throw new Error("Update method must be implemented.");
  }
}
