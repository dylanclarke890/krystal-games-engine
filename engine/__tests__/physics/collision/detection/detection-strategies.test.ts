import {
  arePointsColliding,
  isPointCollidingWithRect,
  areRectsColliding,
} from "../../../../physics/collision/detection/detection-strategies";
import { Vector2 } from "../../../../maths/vector2";

describe("pointVsPoint", () => {
  it("should return true for points in the same location", () => {
    const a = new Vector2(50, 50);
    const b = new Vector2(50, 50);
    expect(arePointsColliding(a, b)).toBe(true);
  });
  it("should return false for points in different locations", () => {
    const a = new Vector2(50, 50);
    const b = new Vector2(50, 51);
    expect(arePointsColliding(a, b)).toBe(false);
  });
});

describe("pointVsRect", () => {
  it("should return true for points within the rectangle", () => {
    const rectPos = new Vector2(50, 50);
    const rectSize = new Vector2(50, 50);

    [new Vector2(50, 50), new Vector2(75, 75), new Vector2(99, 99)].forEach((point) => {
      expect(isPointCollidingWithRect(point, rectPos, rectSize)).toBe(true);
    });
  });
  it("should return false for points outside the rectangle", () => {
    const rectPos = new Vector2(50, 50);
    const rectSize = new Vector2(50, 50);

    [new Vector2(49, 50), new Vector2(100, 101)].forEach((point) => {
      expect(isPointCollidingWithRect(point, rectPos, rectSize)).toBe(false);
    });
  });
});

describe("rectVsRect", () => {
  it("should return true for overlapping rectangles", () => {
    const a = {
      pos: new Vector2(25, 25),
      size: new Vector2(50, 50),
    };
    const b = {
      pos: new Vector2(50, 50),
      size: new Vector2(50, 50),
    };

    expect(areRectsColliding(a.pos, a.size, b.pos, b.size)).toBe(true);
  });
  it("should return false for rectangles not overlapping", () => {
    const a = {
      pos: new Vector2(50, 50),
      size: new Vector2(50, 50),
    };
    const b = {
      pos: new Vector2(0, 0),
      size: new Vector2(50, 50),
    };

    expect(areRectsColliding(a.pos, a.size, b.pos, b.size)).toBe(false);
  });
});
