export const config: GameConfig = {
  loop: {
    targetFps: 60,
    maxFrameTime: 100,
  },
  quadtreeMaxDepth: 20,
  trackObjectCreation: true,
  collisionAdjustmentBuffer: 0.1,
  handleViewportCollisions: true,
  physicsIntegrator: "euler",
};

export type LoopSettings = {
  /** Frames per second. */
  targetFps: number;
  /** In milliseconds. */
  maxFrameTime: number;
};

export type GameConfig = {
  loop: LoopSettings;
  quadtreeMaxDepth: number;
  trackObjectCreation: boolean;
  collisionAdjustmentBuffer: number;
  handleViewportCollisions: boolean;
  physicsIntegrator: "euler" | "rk4" | "verlet";
};
