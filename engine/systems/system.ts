/* eslint-disable no-unused-vars */
import { ComponentMap, EntityManager } from "../entities/entity-manager";
import { Guard } from "../utils/guard";
import { SystemTypes } from "./system-types";

export type RequiredComponent = keyof ComponentMap & string;

export class System {
  static requiredComponents: RequiredComponent[];
  static systemType: SystemTypes;
  entityManager: EntityManager;

  constructor(entityManager: EntityManager) {
    Guard.againstNull({ entityManager }).isInstanceOf(EntityManager);
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
