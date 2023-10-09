export const config: GameConfig = {
  frameRate: 60,
  quadtreeMaxDepth: 20,
  trackObjectCreation: true,
  collisionAdjustmentBuffer: 0.1,
};

export type GameConfig = {
  frameRate: number;
  quadtreeMaxDepth: number;
  trackObjectCreation: boolean;
  collisionAdjustmentBuffer: number;
};
