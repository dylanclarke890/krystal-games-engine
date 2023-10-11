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

export class KrystalGameEngine {
  context: GameContext;
  loop: ILoop;

  constructor(canvasId: Nullable<string>, width: number, height: number) {
    const viewport = new Viewport(width, height, canvasId);
    const eventManager = new EventManager();
    const configManager = new ConfigManager(config);
    const objectPoolManager = new ObjectPoolManager();
    const entityManager = new EntityManager(eventManager);
    const systemManager = new SystemManager(entityManager, eventManager);
    const inputManager = new InputManager(eventManager, viewport);

    this.context = new GameContext(
      eventManager,
      entityManager,
      systemManager,
      inputManager,
      configManager,
      objectPoolManager,
      viewport
    );

    const quadtree = new Quadtree(this.context, { maxDepth: configManager.getInt("quadtreeMaxDepth") });
    const detector = new CollisionDetector(this.context, quadtree);
    const resolver = new CollisionResolver(this.context);
    const integrator = this.#getIntegrator();

    this.context.systems.addSystem(new InputSystem(this.context));
    this.context.systems.addSystem(new PhysicsSystem(this.context, quadtree, detector, resolver, integrator));
    this.context.systems.addSystem(new RenderSystem(this.context));
    this.loop = new GameLoop(this.context);
  }

  #getIntegrator(): BaseIntegrator {
    const integratorType = this.context.config.getString("physicsIntegrator") ?? "euler";
    switch (integratorType) {
      case "euler":
        return new SemiImplicitEulerIntegrator(this.context);
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
