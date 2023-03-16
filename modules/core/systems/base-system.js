import { Guard } from "../../lib/sanity/guard.js";
import { EventSystem, GameEvents } from "../event-system.js";

export class SystemBase {
  /** @param {import("../managers/entity-manager.js").EntityManager} entityManager */
  constructor(name, entityManager, componentFilterQuery) {
    Guard.againstNull({ entityManager });
    Guard.againstNull({ name }).isTypeOf("string");
    Guard.againstNull({ componentFilterQuery }).isTypeOf("function");
    this.name = name;
    this.entityManager = entityManager;
    this.componentFilterQuery = componentFilterQuery;
  }

  bindEvents() {
    EventSystem.on(GameEvents.Frame_BeforeUpdate, listener);
  }

  update() {
    throw new Error("Update method must be implemented.");
  }
}
