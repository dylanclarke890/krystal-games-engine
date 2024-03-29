import { elastic1D, inelastic1D, inelastic2D } from "../../../../physics/collision/resolution/resolution-strategies";
import { ScalarValue } from "../../../../maths/scalar-value";
import { Vector2 } from "../../../../maths/vector2";

describe("elastic1D", () => {
  it("equal masses", () => {
    const aVel = new ScalarValue(100);
    const aMass = new ScalarValue(2);

    const bVel = new ScalarValue(-50);
    const bMass = new ScalarValue(2);

    elastic1D(aVel, bVel, aMass, bMass);

    expect(aVel.value).toBe(-50);
    expect(bVel.value).toBe(100);
  });

  it("different masses", () => {
    const aVel = new ScalarValue(30);
    const aMass = new ScalarValue(2);

    const bVel = new ScalarValue(-30);
    const bMass = new ScalarValue(1);

    elastic1D(aVel, bVel, aMass, bMass);

    expect(aVel.value).toBe(-10);
    expect(bVel.value).toBe(50);
  });
});

describe("inelastic1D", () => {
  it("equal masses", () => {
    const aVel = new ScalarValue(100);
    const aMass = new ScalarValue(2);

    const bVel = new ScalarValue(-50);
    const bMass = new ScalarValue(2);

    inelastic1D(aVel, bVel, aMass, bMass);

    expect(aVel.value).toBe(25);
    expect(bVel.value).toBe(25);
  });

  test("different masses", () => {
    const aVel = new ScalarValue(20);
    const aMass = new ScalarValue(7);

    const bVel = new ScalarValue(-10);
    const bMass = new ScalarValue(4);

    inelastic1D(aVel, bVel, aMass, bMass);

    expect(aVel.value).toBeCloseTo(9.09);
    expect(bVel.value).toBeCloseTo(9.09);
  });
});

describe("inelastic2D", () => {
  it("equal masses", () => {
    const aVel = new Vector2(20, 30);
    const aMass = new ScalarValue(14);

    const bVel = new Vector2(-10, -40);
    const bMass = new ScalarValue(14);

    inelastic2D(aVel, bVel, aMass, bMass);

    [aVel, bVel].forEach((vel) => {
      expect(vel.x).toBe(5);
      expect(vel.y).toBe(-5);
    });
  });

  it("different masses", () => {
    const aVel = new Vector2(40, 20);
    const aMass = new ScalarValue(8);

    const bVel = new Vector2(-10, -30);
    const bMass = new ScalarValue(12);

    inelastic2D(aVel, bVel, aMass, bMass);

    [aVel, bVel].forEach((vel) => {
      expect(vel.x).toBe(10);
      expect(vel.y).toBe(-10);
    });
  });
});
