import { Vector2D } from "../../utils/maths/vector-2d";
import { Quadtree } from "../../physics/collision/broadphase/quadtree";
import { RigidBody } from "../../components/2d/rigid-body";
import { ObjectPoolManager } from "../../managers/object-pool-manager";
import { RectCollider } from "../../components/2d/collision";
import { Viewport } from "../../graphics/viewport";

it("Quadtree handles nodes correctly", () => {
  // Setup
  HTMLCanvasElement.prototype.getContext = jest.fn();
  const viewport = new Viewport(200, 200);
  const quadtree = new Quadtree(viewport, new ObjectPoolManager(), { maxChildren: 1 });

  const aRigidBody = new RigidBody(new Vector2D(10, 10));
  const aCollider = new RectCollider(new Vector2D(10, 10));
  aRigidBody.addCollider(aCollider);

  const bRigidBody = new RigidBody(new Vector2D(180, 110));
  const bCollider = new RectCollider(new Vector2D(10, 10));
  bRigidBody.addCollider(bCollider);

  // Inserts nodes correctly
  quadtree.insert(1, aRigidBody, aCollider);
  quadtree.insert(2, bRigidBody, bCollider);
  expect(quadtree.size).toBe(2);

  // Retrieves expected nodes and doesn't return nodes in different quadrants
  const aRetrieved = quadtree.retrieve(aRigidBody, aCollider);
  const bRetrieved = quadtree.retrieve(bRigidBody, bCollider);
  expect(bRetrieved.length).toBe(1);
  expect(aRetrieved.length).toBe(1);

  expect(aRetrieved[0].id).toBe(1);
  expect(bRetrieved[0].id).toBe(2);

  // clears correctly
  quadtree.clear();
  expect(quadtree.size).toBe(0);
  expect(quadtree.retrieve(aRigidBody, aCollider).length).toBe(0);
});
