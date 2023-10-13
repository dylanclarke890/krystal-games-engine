import { BaseComponent } from "../components/base.js";
import { SideOfCollision } from "../constants/enums.js";
import { ColliderEntity } from "../physics/collision/data.js";
import { BitwiseFlags } from "../utils/bitwise-flags.js";

export type EntityCollisionEvent = {
  a: ColliderEntity;
  b: ColliderEntity;
  sides: BitwiseFlags<SideOfCollision>;
};

export type ComponentEvent = {
  entity: number;
  component: BaseComponent;
};
