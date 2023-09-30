import { config, GameConfig } from "./config.js";
import { CollisionDetector, CollisionResolver } from "./physics/collision/index.js";
import { EntityManager } from "./managers/entity-manager.js";
import { Quadtree } from "./physics/collision/broadphase/quadtree.js";
import { EventManager } from "./managers/event-manager.js";
import { Viewport } from "./graphics/viewport.js";
import { InputManager } from "./managers/input-manager.js";
import { InputSystem, PhysicsSystem, RenderSystem, SystemManager } from "./systems/index.js";
import { GameLoop } from "./time/game-loop.js";
import { IConfigManager, IEntityManager, IEventManager, ILoop, IObjectPoolManager } from "./types/common-interfaces.js";
import { ObjectPoolManager } from "./managers/object-pool-manager.js";
import { ConfigManager } from "./managers/config-manager.js";

export class KrystalGameEngine {
  viewport: Viewport;
  loop: ILoop;

  eventManager!: IEventManager;
  systemManager!: SystemManager;
  entityManager!: IEntityManager;
  inputManager!: InputManager;
  configManager!: IConfigManager<GameConfig>;
  objectPoolManager!: IObjectPoolManager;

  /**
   * @param canvasId Id of the canvas, if known.
   * @param width Width of the viewport.
   * @param height Height of the viewport.
   */
  constructor(canvasId: Nullable<string>, width: number, height: number) {
    this.viewport = new Viewport(width, height, canvasId);
    this.#setupManagers();
    this.#setupSystems();
    this.loop = new GameLoop(this.eventManager, this.configManager.getInt("frameRate") ?? 60);
  }

  #setupManagers() {
    this.objectPoolManager = new ObjectPoolManager();
    this.eventManager = new EventManager();
    this.configManager = new ConfigManager(config);
    this.entityManager = new EntityManager(this.eventManager);
    this.systemManager = new SystemManager(this.entityManager, this.eventManager);
    this.inputManager = new InputManager(this.eventManager, this.viewport);
  }

  #setupSystems() {
    const entityManager = this.entityManager;
    const eventManager = this.eventManager;
    const configManager = this.configManager;
    const systemManager = this.systemManager;

    const quadtree = new Quadtree(this.viewport, this.objectPoolManager, {
      maxDepth: configManager.getInt("quadtreeMaxDepth"),
    });
    const detector = new CollisionDetector(entityManager, this.viewport, quadtree);
    const resolver = new CollisionResolver(entityManager, this.viewport);

    systemManager.addSystem(new InputSystem(entityManager, eventManager, this.inputManager));
    systemManager.addSystem(new PhysicsSystem(entityManager, eventManager, quadtree, detector, resolver));
    systemManager.addSystem(new RenderSystem(entityManager, eventManager, this.viewport));
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
