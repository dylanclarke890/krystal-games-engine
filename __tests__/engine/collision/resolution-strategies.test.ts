import { elastic1D, inelastic1D, inelastic2D } from "../../../engine/collision/resolution-strategies";
import { ScalarValue } from "../../../engine/utils/maths/scalar-value.js";
import { Vector2D } from "../../../engine/utils/maths/vector-2d.js";

describe("elastic1D", () => {
  test("equal masses", () => {
    const aVel = new ScalarValue(100);
    const aMass = new ScalarValue(2);

    const bVel = new ScalarValue(-50);
    const bMass = new ScalarValue(2);

    const [newVelA, newVelB] = elastic1D(aVel, bVel, aMass, bMass);

    expect(newVelA).toBe(-50);
    expect(newVelB).toBe(100);
  });

  test("different masses", () => {
    const aVel = new ScalarValue(30);
    const aMass = new ScalarValue(2);

    const bVel = new ScalarValue(-30);
    const bMass = new ScalarValue(1);

    const [newVelA, newVelB] = elastic1D(aVel, bVel, aMass, bMass);

    expect(newVelA).toBe(-10);
    expect(newVelB).toBe(50);
  });
});

describe("inelastic1D", () => {
  test("equal masses", () => {
    const aVel = new ScalarValue(100);
    const aMass = new ScalarValue(2);

    const bVel = new ScalarValue(-50);
    const bMass = new ScalarValue(2);

    const [newVelA, newVelB] = inelastic1D(aVel, bVel, aMass, bMass);

    expect(newVelA).toBe(25);
    expect(newVelB).toBe(25);
  });

  test("different masses", () => {
    const aVel = new ScalarValue(20);
    const aMass = new ScalarValue(7);

    const bVel = new ScalarValue(-10);
    const bMass = new ScalarValue(4);

    const [newVelA, newVelB] = inelastic1D(aVel, bVel, aMass, bMass);

    expect(newVelA).toBeCloseTo(9.09);
    expect(newVelB).toBeCloseTo(9.09);
  });
});

describe("inelastic2D", () => {
  test("equal masses", () => {
    const aVel = new Vector2D(20, 30);
    const aMass = new ScalarValue(14);

    const bVel = new Vector2D(-10, -40);
    const bMass = new ScalarValue(14);

    const [newVelA, newVelB] = inelastic2D(aVel, bVel, aMass, bMass);

    expect(newVelA).toBe(5);
    expect(newVelB).toBe(-5);
  });

  test("different masses", () => {
    const aVel = new Vector2D(40, 20);
    const aMass = new ScalarValue(8);

    const bVel = new Vector2D(-10, -30);
    const bMass = new ScalarValue(12);

    const [newVelX, newVelY] = inelastic2D(aVel, bVel, aMass, bMass);

    expect(newVelX).toBe(10);
    expect(newVelY).toBe(-10);
  });
});
