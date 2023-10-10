export const config: GameConfig = {
  frameRate: 60,
  quadtreeMaxDepth: 20,
  trackObjectCreation: true,
  collisionAdjustmentBuffer: 0.1,
  handleViewportCollisions: true,
  physicsIntegrator: "euler",
};

export type GameConfig = {
  frameRate: number;
  quadtreeMaxDepth: number;
  trackObjectCreation: boolean;
  collisionAdjustmentBuffer: number;
  handleViewportCollisions: boolean;
  physicsIntegrator: "euler" | "rk4" | "verlet";
};
