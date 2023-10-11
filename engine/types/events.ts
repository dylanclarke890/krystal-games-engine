import { BaseComponent } from "../components/base.js";
import { Collider } from "../components/collider.js";
import { RigidBody } from "../components/rigid-body.js";
import { SideOfCollision } from "../constants/enums.js";
import { BitwiseFlags } from "../utils/bitwise-flags.js";

export type ViewportCollisionEvent = {
  id: number;
  rigidBody: RigidBody;
  collider: Collider;
  sides: BitwiseFlags<SideOfCollision>;
};

export type EntityCollisionEvent = {
  a: { id: number; rigidBody: RigidBody };
  b: { id: number; rigidBody: RigidBody };
  sides: BitwiseFlags<SideOfCollision>;
};

export type ComponentEvent = {
  entity: number;
  component: BaseComponent;
};
