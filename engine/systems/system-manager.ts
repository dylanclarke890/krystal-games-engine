import { SystemTypes, GameEvents } from "../constants/enums.js";
import { Assert } from "../utils/assert.js";
import { GameSystem, GameSystemType } from "../types/common-types.js";
import { System } from "./system.js";
import { IEntityManager, IEventSystem } from "../types/common-interfaces.js";

export class SystemManager {
  eventSystem: IEventSystem;
  entityManager: IEntityManager;
  systems: Set<System>;
  buckets: Map<string, Set<number>>;

  constructor(eventSystem: IEventSystem, entityManager: IEntityManager) {
    this.eventSystem = eventSystem;
    this.entityManager = entityManager;

    this.systems = new Set();
    this.buckets = new Map();

    this.eventSystem.on(GameEvents.Loop_BeforeStart, () =>
      this.systems.forEach((system) => this.#validateSystem(system))
    );
    this.eventSystem.on(GameEvents.Loop_NextFrame, (dt: number) => this.update(dt));
  }

  #validateSystem(system: System): void {
    const name = (<typeof System>system.constructor).name;
    const required = (<typeof System>system.constructor).requiredComponents;
    const type = (<typeof System>system.constructor).systemType;

    Assert.defined(`${name} requiredComponents`, required);
    Assert.instanceOf(`${name} systemType`, type, SystemTypes);
  }

  registerSystem(system: System) {
    Assert.instanceOf("System", system, System);
    this.systems.add(system);
    system.setup();
  }

  unregisterSystem(system: System) {
    Assert.instanceOf("System", system, System);
    system.cleanup();
    this.systems.delete(system);
  }

  getSystem<T extends GameSystemType>(name: T): Nullable<GameSystem<T>> {
    let system: Nullable<GameSystem<T>>;

    this.systems.forEach((sys) => {
      if (name === (sys.constructor.name as GameSystemType)) {
        system = sys as GameSystem<T>;
      }
    });

    return system;
  }

  update(dt: number) {
    this.buckets.clear();

    this.entityManager.entities.forEach((entity) => {
      this.systems.forEach((system) => {
        const components = (<typeof System>system.constructor).requiredComponents;
        if (!this.entityManager.hasComponents(entity, components)) {
          return;
        }

        const name = (<typeof System>system.constructor).name;
        if (!this.buckets.has(name)) {
          this.buckets.set(name, new Set());
        }
        this.buckets.get(name)!.add(entity);
      });
    });

    this.systems.forEach((system) => {
      system.update(dt, this.buckets.get(system.constructor.name) ?? new Set());
    });
  }
}
