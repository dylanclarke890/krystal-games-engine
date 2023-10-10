import { Vector2 } from "../../../../maths/vector2";
import { Quadtree } from "../../../../physics/collision/broadphase/quadtree";
import { RigidBody, RectCollider, Transform } from "../../../../components/index";
import { MockContext } from "../../../test-context.js";

it("Quadtree handles nodes correctly", () => {
  // Setup
  const context = new MockContext();
  const quadtree = new Quadtree(context, { maxChildren: 1 });

  const aTransform = new Transform();
  aTransform.position = new Vector2(10, 10);
  const aRigidBody = new RigidBody(aTransform);
  const aCollider = new RectCollider(new Vector2(10, 10));
  aRigidBody.addCollider(aCollider);

  const bTransform = new Transform();
  bTransform.position = new Vector2(180, 110);
  const bRigidBody = new RigidBody(bTransform);
  const bCollider = new RectCollider(new Vector2(10, 10));
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
