import { config } from "./config.js";
import { CollisionDetector, CollisionResolver } from "../physics/collision/index.js";
import { EntityManager } from "../managers/entity-manager.js";
import { Quadtree } from "../physics/collision/broadphase/quadtree.js";
import { EventManager } from "../managers/event-manager.js";
import { Viewport } from "../graphics/viewport.js";
import { InputManager } from "../managers/input-manager.js";
import { InputSystem, RenderSystem, SystemManager, PhysicsSystem } from "../systems/index.js";
import { GameLoop } from "../time/game-loop.js";
import { ILoop } from "../types/common-interfaces.js";
import { ObjectPoolManager } from "../managers/object-pool-manager.js";
import { ConfigManager } from "../managers/config-manager.js";
import { World } from "../physics/world.js";
import { VerletIntegrator } from "../physics/integrators/verlet-integrator.js";
import { SemiImplicitEulerIntegrator } from "../physics/integrators/euler-integrator.js";
import { GameContext } from "./context.js";

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

    const frameRate = configManager.getInt("frameRate") ?? 60;
    const maxDepth = configManager.getInt("quadtreeMaxDepth");
    const quadtree = new Quadtree(this.context, { maxDepth });
    const detector = new CollisionDetector(this.context, quadtree);
    const resolver = new CollisionResolver(this.context);
    const integrator = new SemiImplicitEulerIntegrator(this.context, frameRate);
    new VerletIntegrator(this.context, frameRate);

    this.context.world = new World(integrator);
    this.context.systems.addSystem(new InputSystem(this.context));
    this.context.systems.addSystem(new PhysicsSystem(this.context, quadtree, detector, resolver));
    this.context.systems.addSystem(new RenderSystem(this.context));
    this.loop = new GameLoop(this.context, frameRate);
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
