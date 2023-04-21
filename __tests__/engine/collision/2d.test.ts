import { perfectInelastic } from "../../../engine/collision/2d";

describe("getNewVelocitiesForPerfectlyInelastic", () => {
  test("equal masses", () => {
    const vAiX = 20;
    const vAiY = 30;
    const vBiX = -10;
    const vBiY = -40;
    const mA = 14;
    const mB = 14;

    const [newVelA, newVelB] = perfectInelastic(vAiX, vAiY, vBiX, vBiY, mA, mB);

    expect(newVelA).toBe(5);
    expect(newVelB).toBe(-5);
  });

  test("different masses", () => {
    const vAiX = 40;
    const vAiY = 20;
    const vBiX = -10;
    const vBiY = -30;
    const mA = 8;
    const mB = 12;

    const [newVelX, newVelY] = perfectInelastic(vAiX, vAiY, vBiX, vBiY, mA, mB);

    expect(newVelX).toBe(10);
    expect(newVelY).toBe(-10);
  });
});
