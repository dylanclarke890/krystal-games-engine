export const config: GameConfig = {
  loop: {
    frameRate: 60,
    maxFrameTime: 100,
  },
  quadtreeMaxDepth: 20,
  trackObjectCreation: true,
  collisionAdjustmentBuffer: 0.1,
  handleViewportCollisions: true,
  physicsIntegrator: "euler",
};

export type GameConfig = {
  loop: {
    /** Frames per second. */
    frameRate: number;
    /** In milliseconds. */
    maxFrameTime: number;
  };
  quadtreeMaxDepth: number;
  trackObjectCreation: boolean;
  collisionAdjustmentBuffer: number;
  handleViewportCollisions: boolean;
  physicsIntegrator: "euler" | "rk4" | "verlet";
};
