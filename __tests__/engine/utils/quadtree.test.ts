import { Vector2D } from "../../../engine/utils/maths/vector-2d";
import { BoundsNode, PointNode, Quadtree } from "../../../engine/utils/quadtree";

describe("Quadtree", () => {
  it("handles point nodes correctly", () => {
    // Setup
    const topLeft = new Vector2D(0, 0);
    const size = new Vector2D(100, 100);
    const quadtree = new Quadtree(topLeft, size, { pointQuad: true, maxChildren: 1 });

    const point1 = new PointNode(new Vector2D(10, 10), new Vector2D(1, 1), 0);
    const point2 = new PointNode(new Vector2D(90, 90), new Vector2D(1, 1), 0);

    // Insert points
    quadtree.insert([point1, point2]);
    expect(quadtree.size).toBe(2);

    // Retrieve points
    const retrieved1 = quadtree.retrieve(point1);
    const retrieved2 = quadtree.retrieve(point2);

    expect(retrieved1).toContain(point1);
    expect(retrieved2).toContain(point2);

    // Make sure it doesn't return nodes not in the same quadrant
    expect(retrieved1).not.toContain(point2);
    expect(retrieved2).not.toContain(point1);

    // clear quadtree
    quadtree.clear();
    expect(quadtree.size).toBe(0);

    // Make sure the node isn't there anymore
    const retrieved3 = quadtree.retrieve(point1);
    expect(retrieved3).not.toContain(point1);
  });

  it("handles bounds nodes correctly", () => {
    // Setup
    const topLeft = new Vector2D(0, 0);
    const size = new Vector2D(100, 100);
    const quadtree = new Quadtree(topLeft, size, { pointQuad: false, maxChildren: 1 });

    const bounds1 = new BoundsNode(new Vector2D(10, 10), new Vector2D(10, 10), 0);
    const bounds2 = new BoundsNode(new Vector2D(90, 90), new Vector2D(10, 10), 0);

    // Insert bounds
    quadtree.insert([bounds1, bounds2]);
    expect(quadtree.size).toBe(2);

    // Retrieve bounds
    const retrieved1 = quadtree.retrieve(bounds1);
    const retrieved2 = quadtree.retrieve(bounds2);

    expect(retrieved1).toContain(bounds1);
    expect(retrieved2).toContain(bounds2);

    // Make sure it doesn't return nodes not in the same quadrant
    expect(retrieved1).not.toContain(bounds2);
    expect(retrieved2).not.toContain(bounds1);

    // clear quadtree
    quadtree.clear();
    expect(quadtree.size).toBe(0);

    // Make sure the node isn't there anymore
    const retrieved3 = quadtree.retrieve(bounds1);
    expect(retrieved3).not.toContain(bounds1);
  });
});