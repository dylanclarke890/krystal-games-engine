import { EventSystem } from "./events/event-system.js";
import { EntityManager } from "./entities/entity-manager.js";
import { GameLoop } from "./time/game-loop.js";
import { Viewport } from "./graphics/viewport.js";
import { InputManager } from "./input/input-manager.js";
import { CollisionDetector } from "./collision/detector.js";
import { CollisionResolver } from "./collision/resolver.js";
import { InputSystem, PhysicSystem, RenderSystem, SystemManager } from "./systems/index.js";
import { EntityQuadtree } from "./entities/entity-quadtree.js";
import { config } from "./config.js";

export class Game {
  viewport: Viewport;
  eventSystem: EventSystem;
  entityManager: EntityManager;
  systemManager: SystemManager;
  inputManager: InputManager;
  loop: GameLoop;

  /**
   * @param {string?} canvasId Id of the canvas, if known.
   * @param {number} width Width of the canvas.
   * @param {number} height Height of the canvas.
   */
  constructor(canvasId: string | undefined, width: number, height: number) {
    this.viewport = new Viewport(width, height, canvasId);
    this.eventSystem = new EventSystem();
    this.entityManager = new EntityManager(this.eventSystem);
    this.systemManager = new SystemManager(this.eventSystem, this.entityManager);
    this.inputManager = new InputManager(this.eventSystem, this.viewport);
    this.loop = new GameLoop(this.eventSystem, config.frameRate);
    this.setup();
  }

  setup() {
    const entityManager = this.entityManager;
    const eventSystem = this.eventSystem;

    const quadtree = new EntityQuadtree(this.viewport, { maxDepth: config.quadtreeMaxDepth });
    const detector = new CollisionDetector(entityManager, this.viewport, quadtree);
    const resolver = new CollisionResolver(entityManager, this.viewport);

    this.systemManager.registerSystem(new InputSystem(entityManager, eventSystem, this.inputManager));
    this.systemManager.registerSystem(new PhysicSystem(entityManager, eventSystem, quadtree, detector, resolver));
    this.systemManager.registerSystem(new RenderSystem(entityManager, eventSystem, this.viewport));
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
