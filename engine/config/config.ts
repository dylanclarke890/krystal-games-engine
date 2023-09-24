export const config: GameConfig = {
  frameRate: 60,
  quadtreeMaxDepth: 20,
};

export type GameConfig = {
  frameRate: number;
  quadtreeMaxDepth: number;
};
