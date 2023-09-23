import { Vector2D } from "../../engine/utils/maths/vector-2d";
import { Quadtree, QuadtreeNode } from "../../engine/utils/quadtree";

it("Quadtree handles nodes correctly", () => {
  // Setup
  const quadtree = new Quadtree(new Vector2D(0, 0), new Vector2D(100, 100), { maxChildren: 1 });
  const node1 = new QuadtreeNode(new Vector2D(20, 20), new Vector2D(10, 10));
  const node2 = new QuadtreeNode(new Vector2D(80, 80), new Vector2D(10, 10));

  // Inserts nodes correctly
  quadtree.insert([node1, node2]);
  expect(quadtree.size).toBe(2);

  // Retrieves expected nodes and doesn't return nodes in different quadrants
  const retrieved1 = quadtree.retrieve(node1);
  const retrieved2 = quadtree.retrieve(node2);
  expect(retrieved1).toContain(node1);
  expect(retrieved2).toContain(node2);
  expect(retrieved1).not.toContain(node2);
  expect(retrieved2).not.toContain(node1);

  // clears correctly
  quadtree.clear();
  expect(quadtree.size).toBe(0);
  expect(quadtree.retrieve(node1)).not.toContain(node1);
});
