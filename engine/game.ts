import { EventSystem } from "./events/event-system.js";
import { EntityManager } from "./entities/entity-manager.js";
import { GameLoop } from "./time/game-loop.js";
import { Viewport } from "./graphics/viewport.js";
import { InputManager } from "./input/input-manager.js";
import { CollisionDetector } from "./collision/detector.js";
import { CollisionResolver } from "./collision/resolver.js";
import { InputSystem, PhysicSystem, RenderSystem, SystemManager } from "./systems/index.js";
import { BoundsNode, Quadtree } from "./utils/quadtree.js";
import { Position, Size } from "./components/index.js";

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
    this.loop = new GameLoop(this.eventSystem, 60);

    const quadtree = new Quadtree(new Position(0, 0), new Size(100, 100), { maxChildren: 1 });
    const point1 = new BoundsNode(new Position(10, 10), new Size(10, 10));
    const point2 = new BoundsNode(new Position(90, 90), new Size(10, 10));
    quadtree.insert([point1, point2]);
    const result = quadtree.retrieve(point1);
    console.log(result);

    this.setup();
  }

  setup() {
    this.systemManager.registerSystem(new InputSystem(this.entityManager, this.inputManager));

    const detector = new CollisionDetector(this.entityManager, this.viewport);
    const resolver = new CollisionResolver(this.entityManager, this.viewport);
    this.systemManager.registerSystem(new PhysicSystem(this.entityManager, detector, resolver));

    this.systemManager.registerSystem(new RenderSystem(this.entityManager, this.viewport));
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
