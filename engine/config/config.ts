export const config: GameConfig = {
  frameRate: 60,
  quadtreeMaxDepth: 20,
  trackObjectCreation: true,
};

export type GameConfig = {
  frameRate: number;
  quadtreeMaxDepth: number;
  trackObjectCreation: boolean;
};
