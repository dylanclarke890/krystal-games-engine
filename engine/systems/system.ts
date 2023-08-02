import { EntityManager } from "../entities/entity-manager.js";
import { Assert } from "../utils/assert.js";
import { ComponentType } from "../utils/types.js";
import { SystemTypes } from "./system-types.js";

export class System {
  static requiredComponents: ComponentType[];
  static systemType: SystemTypes;
  entityManager: EntityManager;

  constructor(entityManager: EntityManager) {
    Assert.instanceOf("entityManager", entityManager, EntityManager);
    this.entityManager = entityManager;
  }

  setup() {
    /* stub */
  }

  /** @param _dt Delta time since last frame. */
  update(_dt: number): void {
    throw new Error("Update method must be implemented.");
  }
}
