import { Entity } from "../../core/entity.js";
import { Register } from "../../core/register.js";

/**
 * This entity does nothing but just sits there. It can be used as a target
 * for other entities, such as movers.
 */
export class EntityVoid extends Entity {
  _levelEditorDrawBox = true;
  _levelEditorColor = "rgba(128, 28, 230, 0.7)";

  size = { x: 8, y: 8 };

  update() {}
}

Register.entityType(EntityVoid);
