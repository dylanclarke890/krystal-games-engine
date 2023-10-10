import { SemiImplicitEulerIntegrator } from "../../../physics/integrators/euler-integrator";
import { RigidBody, Transform } from "../../../components/index";
import { Vector2 } from "../../../maths/vector2";
import { GameContext } from "../../../core/context.js";
import {
  EntityManager,
  ObjectPoolManager,
  EventManager,
  SystemManager,
  InputManager,
  ConfigManager,
} from "../../../managers/index";
import { Viewport } from "../../../graphics/viewport.js";
import { config } from "../../../core/config.js";
import { World } from "../../../physics/world.js";

describe("EulerIntegrator", () => {
  let context: GameContext;
  let integrator: SemiImplicitEulerIntegrator;
  let rigidBody: RigidBody;

  beforeEach(() => {
    HTMLCanvasElement.prototype.getContext = jest.fn();
    const eventManager = new EventManager();
    const entityManager = new EntityManager(eventManager);
    const systemManager = new SystemManager(entityManager, eventManager);
    const viewport = new Viewport(500, 500, "canvasId");
    const inputManager = new InputManager(eventManager, viewport);
    const objectPoolManager = new ObjectPoolManager();
    context = new GameContext(
      eventManager,
      entityManager,
      systemManager,
      inputManager,
      new ConfigManager(config),
      objectPoolManager,
      viewport
    );
    integrator = new SemiImplicitEulerIntegrator(context);
    context.world = new World(integrator, new Vector2(0, 9.8));
    rigidBody = new RigidBody(new Transform());
  });

  it("should apply gravity force correctly", () => {
    rigidBody.mass = 1;
    rigidBody.applyForce(context.world.gravity.mulScalar(rigidBody.mass));

    // Simulate one second
    integrator.integrate(1, rigidBody, 1);

    // expect the velocity to have changed by gravity's value after 1 second.
    expect(rigidBody.velocity.y).toBeCloseTo(9.8);
  });

  it("should bring the object to rest when velocity is within epsilon range", () => {
    rigidBody.velocity = new Vector2(1e-6, 1e-6); // A very small velocity

    integrator.integrate(1, rigidBody, 1);

    expect(rigidBody.velocity.magnitude()).toBe(0);
  });
});
