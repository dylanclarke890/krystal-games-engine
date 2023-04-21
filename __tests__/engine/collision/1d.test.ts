import { perfectInelastic } from "../../../engine/collision/1d";

describe("getNewVelocitiesForPerfectlyInelastic", () => {
  it("calculates the new velocities correctly for equal masses", () => {
    const vAi = 100;
    const vBi = -50;
    const mA = 2;
    const mB = 2;

    const [newVelA, newVelB] = perfectInelastic(vAi, vBi, mA, mB);

    expect(newVelA).toBe(25);
    expect(newVelB).toBe(25);
  });

  it("calculates the new velocities correctly for different masses", () => {
    const vAi = 20;
    const vBi = -10;
    const mA = 7;
    const mB = 4;

    const [newVelA, newVelB] = perfectInelastic(vAi, vBi, mA, mB);

    expect(newVelA).toBeCloseTo(9.09);
    expect(newVelB).toBeCloseTo(9.09);
  });
});
