import { Position, Size } from "../components/index.js";
import { Quadtree, QuadtreeNode } from "../utils/quadtree.js";

export class EntityQuadtreeNode extends QuadtreeNode {
  entityId: number;

  constructor(entityId: number, position: Position, size: Size, depth = 0, maxDepth = 4, maxChildren = 4) {
    super(position, size, depth, maxDepth, maxChildren);
    this.entityId = entityId;
  }
}

export class EntityQuadtree extends Quadtree {
  insertEntity(entityId: number, position: Position, size: Size) {
    const node = new EntityQuadtreeNode(entityId, position, size);
    super.insert(node);
  }

  findEntityNode(
    entityId: number,
    node: EntityQuadtreeNode = this.root as EntityQuadtreeNode
  ): EntityQuadtreeNode | undefined {
    if ((node as EntityQuadtreeNode).entityId === entityId) {
      return node;
    }

    // If the node has children, search them
    for (let child of node.children) {
      const foundNode = this.findEntityNode(entityId, child as EntityQuadtreeNode);
      if (foundNode) {
        return foundNode;
      }
    }

    // If the node has overlapping children, search them as well
    for (let overlappingChild of node.overlappingChildren) {
      const foundNode = this.findEntityNode(entityId, overlappingChild as EntityQuadtreeNode);
      if (foundNode) {
        return foundNode;
      }
    }

    // Node was not found in this branch
    return undefined;
  }

  removeEntityNode(entityId: number, node: EntityQuadtreeNode = this.root as EntityQuadtreeNode): boolean {
    // If the node has children, search them
    for (let i = 0; i < node.children.length; i++) {
      if ((node.children[i] as EntityQuadtreeNode).entityId === entityId) {
        node.children.splice(i, 1);
        return true;
      }

      const wasRemoved = this.removeEntityNode(entityId, node.children[i] as EntityQuadtreeNode);
      if (wasRemoved) {
        return true;
      }
    }

    // If the node has overlapping children, search them as well
    for (let i = 0; i < node.overlappingChildren.length; i++) {
      if ((node.overlappingChildren[i] as EntityQuadtreeNode).entityId === entityId) {
        node.overlappingChildren.splice(i, 1);
        return true;
      }

      const wasRemoved = this.removeEntityNode(entityId, node.overlappingChildren[i] as EntityQuadtreeNode);
      if (wasRemoved) {
        return true;
      }
    }

    // Node was not found in this branch
    return false;
  }
}
