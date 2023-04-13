/* eslint-disable no-unused-vars */
import { ComponentMap, EntityManager } from "../entities/entity-manager.js";
import { Assert } from "../utils/assert.js";
import { SystemTypes } from "./system-types.js";

export type RequiredComponent = keyof ComponentMap & string;

export class System {
  static requiredComponents: RequiredComponent[];
  static systemType: SystemTypes;
  entityManager: EntityManager;

  constructor(entityManager: EntityManager) {
    Assert.instanceOf("entityManager", entityManager, EntityManager);
    this.entityManager = entityManager;
  }

  setup() {
    /* stub */
  }

  /**
   * @param _dt Delta time since last frame.
   */
  update(_dt: number): void {
    throw new Error("Update method must be implemented.");
  }
}
