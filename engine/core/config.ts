export const config: GameConfig = {
  frameRate: 60,
  quadtreeMaxDepth: 20,
  trackObjectCreation: true,
  collisionAdjustmentBuffer: 0.1,
  handleViewportCollisions: true
};

export type GameConfig = {
  frameRate: number;
  quadtreeMaxDepth: number;
  trackObjectCreation: boolean;
  collisionAdjustmentBuffer: number;
  handleViewportCollisions: boolean;
};
