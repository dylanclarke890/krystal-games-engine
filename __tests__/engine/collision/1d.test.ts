import { elastic, perfectlyInelastic } from "../../../engine/collision/1d";

describe("elastic", () => {
  test("equal masses", () => {
    const vAi = 100;
    const vBi = -50;
    const mA = 2;
    const mB = 2;

    const [newVelA, newVelB] = elastic(vAi, vBi, mA, mB);

    expect(newVelA).toBe(-50);
    expect(newVelB).toBe(100);
  });

  test("different masses", () => {
    const vAi = 30;
    const vBi = -30;
    const mA = 2;
    const mB = 1;

    const [newVelA, newVelB] = elastic(vAi, vBi, mA, mB);

    expect(newVelA).toBe(-10);
    expect(newVelB).toBe(50);
  });
});

describe("perfectInelastic", () => {
  test("equal masses", () => {
    const vAi = 100;
    const vBi = -50;
    const mA = 2;
    const mB = 2;

    const [newVelA, newVelB] = perfectlyInelastic(vAi, vBi, mA, mB);

    expect(newVelA).toBe(25);
    expect(newVelB).toBe(25);
  });

  test("different masses", () => {
    const vAi = 20;
    const vBi = -10;
    const mA = 7;
    const mB = 4;

    const [newVelA, newVelB] = perfectlyInelastic(vAi, vBi, mA, mB);

    expect(newVelA).toBeCloseTo(9.09);
    expect(newVelB).toBeCloseTo(9.09);
  });
});