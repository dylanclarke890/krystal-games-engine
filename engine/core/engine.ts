import { CollisionDetector, CollisionResolver } from "../physics/collision/index.js";
import {
  EntityManager,
  EventManager,
  InputManager,
  SystemManager,
  ObjectPoolManager,
  ConfigManager,
} from "../managers/index.js";
import { Quadtree } from "../physics/collision/broadphase/quadtree.js";
import { Viewport } from "../graphics/viewport.js";
import { InputSystem, RenderSystem, PhysicsSystem } from "../systems/index.js";
import { GameLoop } from "../time/game-loop.js";
import { ILoop } from "../types/common-interfaces.js";
import { SemiImplicitEulerIntegrator, BaseIntegrator } from "../physics/integrators/index.js";
import { config } from "./config.js";
import { GameContext } from "./context.js";
import { InvalidOperationError } from "../types/errors.js";
import { GameEventType } from "../constants/events.js";
import { PhysicsContext } from "../physics/context.js";
import { World } from "../physics/world.js";

export class KrystalGameEngine {
  gameContext: GameContext;
  physicsContext: PhysicsContext;
  loop: ILoop;

  constructor(canvasId: Nullable<string>, width: number, height: number) {
    const viewport = new Viewport(width, height, canvasId);
    const events = new EventManager();
    const configManager = new ConfigManager(config);
    const objectPools = new ObjectPoolManager();
    const entities = new EntityManager(events);
    const systems = new SystemManager(entities, events);
    const input = new InputManager(events, viewport);
    this.gameContext = new GameContext(events, entities, systems, input, configManager, objectPools, viewport);

    const integrator = this.#getIntegrator();
    const broadphase = new Quadtree(this.gameContext);
    const detector = new CollisionDetector(this.gameContext);
    const resolver = new CollisionResolver(this.gameContext);
    const world = new World();
    this.physicsContext = new PhysicsContext(integrator, broadphase, detector, resolver, world);

    this.gameContext.systems.addSystem(new InputSystem(this.gameContext));
    this.gameContext.systems.addSystem(new PhysicsSystem(this.gameContext, this.physicsContext));
    this.gameContext.systems.addSystem(new RenderSystem(this.gameContext));

    this.loop = new GameLoop(this.gameContext);
    events.on(GameEventType.LOOP_STARTED, this.gameContext.systems.update.bind(this.gameContext.systems));
  }

  #getIntegrator(): BaseIntegrator {
    const integratorType = this.gameContext.config.getString("physicsIntegrator") ?? "euler";
    switch (integratorType) {
      case "euler":
        return new SemiImplicitEulerIntegrator(this.gameContext);
      case "verlet":
      case "rk4":
      default:
        throw new InvalidOperationError("Invalid type specified for 'physicsIntegrator'.");
    }
  }

  start() {
    this.loop.start();
  }

  pause() {
    this.loop.stop();
  }

  stop() {
    this.loop.stop(); // TODO: unload resources
  }
}
