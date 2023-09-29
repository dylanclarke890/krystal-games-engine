import { config, GameConfig } from "./config.js";
import { CollisionDetector, CollisionResolver } from "./collision/index.js";
import { EntityManager } from "./managers/entity-manager.js";
import { Quadtree } from "./collision/broadphase/quadtree.js";
import { EventSystem } from "./events/event-system.js";
import { Viewport } from "./graphics/viewport.js";
import { InputManager } from "./managers/input-manager.js";
import { InputSystem, PhysicSystem, RenderSystem, SystemManager } from "./systems/index.js";
import { GameLoop } from "./time/game-loop.js";
import { IConfigManager, IEntityManager, IEventSystem, ILoop, IObjectPoolManager } from "./types/common-interfaces.js";
import { ObjectPoolManager } from "./managers/object-pool-manager.js";
import { ConfigManager } from "./managers/config-manager.js";

export class KrystalGameEngine {
  viewport: Viewport;
  eventSystem: IEventSystem;
  loop: ILoop;

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
    this.eventSystem = new EventSystem();
    this.#setupManagers();
    this.#setupSystems();
    this.loop = new GameLoop(this.eventSystem, this.configManager.getInt("frameRate") ?? 60);
  }

  #setupManagers() {
    this.configManager = new ConfigManager(config);
    this.entityManager = new EntityManager(this.eventSystem);
    this.systemManager = new SystemManager(this.eventSystem, this.entityManager);
    this.inputManager = new InputManager(this.eventSystem, this.viewport);
    this.objectPoolManager = new ObjectPoolManager(this.configManager);
  }

  #setupSystems() {
    const entityManager = this.entityManager;
    const eventSystem = this.eventSystem;
    const configManager = this.configManager;
    const systemManager = this.systemManager;

    const quadtree = new Quadtree(this.viewport, this.objectPoolManager, {
      maxDepth: configManager.getInt("quadtreeMaxDepth"),
    });
    const detector = new CollisionDetector(entityManager, this.viewport, quadtree);
    const resolver = new CollisionResolver(entityManager, this.viewport);

    systemManager.registerSystem(new InputSystem(entityManager, eventSystem, this.inputManager));
    systemManager.registerSystem(new PhysicSystem(entityManager, eventSystem, quadtree, detector, resolver));
    systemManager.registerSystem(new RenderSystem(entityManager, eventSystem, this.viewport));
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
