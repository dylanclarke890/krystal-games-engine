import { getNewVelocitiesForPerfectlyInelastic } from "../../../engine/collision/2d";

describe("getNewVelocitiesForPerfectlyInelastic", () => {
  it("calculates the new velocities correctly for equal masses", () => {
    const vAi = 2;
    const vBi = -1;
    const mA = 2;
    const mB = 2;

    const [newVelA, newVelB] = getNewVelocitiesForPerfectlyInelastic(vAi, vBi, mA, mB);

    expect(newVelA).toBe(-0.5);
    expect(newVelB).toBe(-0.5);
  });

  it("calculates the new velocities correctly for different masses", () => {
    const vAi = 5;
    const vBi = -2;
    const mA = 3;
    const mB = 1;

    const [newVelA, newVelB] = getNewVelocitiesForPerfectlyInelastic(vAi, vBi, mA, mB);

    expect(newVelA).toBeCloseTo(-1);
    expect(newVelB).toBeCloseTo(-1);
  });
});
