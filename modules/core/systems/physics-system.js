import { EventSystem, GameEvents } from "../event-system.js";
import { SystemBase } from "./base-system.js";

export class PhysicsSystem extends SystemBase {
  constructor(entityManager, orderButler) {
    super(entityManager);
    this.orderButler = orderButler;
  }

  bindEvents() {
    EventSystem.on(GameEvents.Loop_NextFrame_BeforeUpdate, () => {
      this.orderButler.filterQuery(
        "physics",
        (i) => i.hasComponent("PositionComponent") && i.hasComponent("VelocityComponent")
      );
    });
  }

  update() {
    const entities = this.entityManager.getEntitiesForSystem("physics");
    console.log(entities);
  }
}

export class OrderButler {
  pendingOrders = {};
  fulfilledOrders = {};

  filterQuery(name, predicate) {
    this.pendingOrders[name] = predicate;
  }

  collectOrders() {
    EventSystem.dispatch(GameEvents.Loop_NextFrame_BeforeUpdate);
  }
}
