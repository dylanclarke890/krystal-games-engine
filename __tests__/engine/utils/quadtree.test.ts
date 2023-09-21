import { Vector2D } from "../../../engine/utils/maths/vector-2d";
import { BoundsNode, PointNode, Quadtree } from "../../../engine/utils/quadtree";

describe("PointNode", () => {
  it("should insert points correctly", () => {
    const rootNode = new PointNode(new Vector2D(0, 0), new Vector2D(100, 100), 0, 4);
    const point1 = new PointNode(new Vector2D(10, 10), new Vector2D(1, 1), 0);
    const point2 = new PointNode(new Vector2D(20, 20), new Vector2D(1, 1), 0);

    rootNode.insert(point1);
    rootNode.insert(point2);

    expect(rootNode.children.length).toBe(2);
  });

  it("should subdivide when max children are reached", () => {
    const rootNode = new PointNode(new Vector2D(0, 0), new Vector2D(100, 100), 0, 2);
    const point1 = new PointNode(new Vector2D(10, 10), new Vector2D(1, 1), 0);
    const point2 = new PointNode(new Vector2D(20, 20), new Vector2D(1, 1), 0);
    const point3 = new PointNode(new Vector2D(30, 30), new Vector2D(1, 1), 0);

    rootNode.insert(point1);
    rootNode.insert(point2);
    rootNode.insert(point3);

    expect(rootNode.nodes.length).toBe(4);
  });

  // Add more tests for retrieve, clear, and other methods
});

describe("BoundsNode", () => {
  // Add tests for BoundsNode similarly to PointNode
});

describe("Quadtree", () => {
  it("should insert and retrieve points correctly", () => {
    const quadtree = new Quadtree(new Vector2D(0, 0), new Vector2D(100, 100), 2, 4, true);
    const point1 = new PointNode(new Vector2D(10, 10), new Vector2D(1, 1), 0);
    const point2 = new PointNode(new Vector2D(20, 20), new Vector2D(1, 1), 0);

    quadtree.insert(point1);
    quadtree.insert(point2);

    const retrievedPoints = quadtree.retrieve(point1);

    expect(retrievedPoints.length).toBe(1);
    expect(retrievedPoints[0]).toStrictEqual(point1);
  });

  it("should insert and retrieve items with bounds correctly", () => {
    const quadtree = new Quadtree(new Vector2D(0, 0), new Vector2D(100, 100), 2, 4, false);
    const bounds1 = new BoundsNode(new Vector2D(10, 10), new Vector2D(10, 10), 0);
    const bounds2 = new BoundsNode(new Vector2D(30, 30), new Vector2D(10, 10), 0);

    quadtree.insert(bounds1);
    quadtree.insert(bounds2);

    const retrievedBounds = quadtree.retrieve(bounds1);

    expect(retrievedBounds.length).toBe(1);
    expect(retrievedBounds[0]).toStrictEqual(bounds1);
  });

  // Add more tests for clear, max depth, and other quadtree features
});
