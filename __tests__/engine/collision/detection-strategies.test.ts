import { pointVsPoint, pointVsRect, rectVsRect } from "../../../engine/collision/detection-strategies";
import { Vector2D } from "../../../engine/utils/maths/vector-2d.js";

describe("pointVsPoint", () => {
  it("should return true for points in the same location", () => {
    const a = new Vector2D(50, 50);
    const b = new Vector2D(50, 50);
    expect(pointVsPoint(a, b)).toBe(true);
  });
  it("should return false for points in different locations", () => {
    const a = new Vector2D(50, 50);
    const b = new Vector2D(50, 51);
    expect(pointVsPoint(a, b)).toBe(false);
  });
});

describe("pointVsRect", () => {
  it("should return true for points within the rectangle", () => {
    const rectPos = new Vector2D(50, 50);
    const rectSize = new Vector2D(50, 50);

    [new Vector2D(50, 50), new Vector2D(75, 75), new Vector2D(99, 99)].forEach((point) => {
      expect(pointVsRect(point, rectPos, rectSize)).toBe(true);
    });
  });
  it("should return false for points outside the rectangle", () => {
    const rectPos = new Vector2D(50, 50);
    const rectSize = new Vector2D(50, 50);

    [new Vector2D(49, 50), new Vector2D(100, 101)].forEach((point) => {
      expect(pointVsRect(point, rectPos, rectSize)).toBe(false);
    });
  });
});

describe("rectVsRect", () => {
  it("should return true for overlapping rectangles", () => {
    const a = {
      pos: new Vector2D(25, 25),
      size: new Vector2D(50, 50),
    };
    const b = {
      pos: new Vector2D(50, 50),
      size: new Vector2D(50, 50),
    };

    expect(rectVsRect(a.pos, a.size, b.pos, b.size)).toBe(true);
  });
  it("should return false for rectangles not overlapping", () => {
    const a = {
      pos: new Vector2D(50, 50),
      size: new Vector2D(50, 50),
    };
    const b = {
      pos: new Vector2D(0, 0),
      size: new Vector2D(50, 50),
    };

    expect(rectVsRect(a.pos, a.size, b.pos, b.size)).toBe(false);
  });
});
