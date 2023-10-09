import { EulerIntegrator } from "../../../physics/integrators/euler-integrator";
import { RigidBody, Transform } from "../../../components/2d/index";
import { Vector2 } from "../../../maths/vector2";
import { ObjectPoolManager } from "../../../managers/object-pool-manager";

describe("EulerIntegrator", () => {
  let integrator: EulerIntegrator;
  let rigidBody: RigidBody;

  beforeEach(() => {
    integrator = new EulerIntegrator(new ObjectPoolManager());
    rigidBody = new RigidBody(new Transform());
  });

  it("should apply gravity force correctly", () => {
    rigidBody.gravity = new Vector2(0, -9.8);
    rigidBody.mass = 1;

    integrator.integrate(rigidBody, 1); // Simulate one second

    // expect the velocity to have changed by gravity's value after 1 second.
    expect(rigidBody.velocity.y).toBeCloseTo(-9.8);
  });

  it("should not apply friction if object is at rest", () => {
    rigidBody.velocity = new Vector2(0, 0);
    rigidBody.friction = 0.5;

    integrator.integrate(rigidBody, 1);

    expect(rigidBody.velocity.magnitude()).toBe(0);
  });

  it("should bring the object to rest when velocity is within epsilon range", () => {
    rigidBody.velocity = new Vector2(1e-6, 1e-6); // A very small velocity

    integrator.integrate(rigidBody, 1);

    expect(rigidBody.velocity.magnitude()).toBe(0);
  });
});
