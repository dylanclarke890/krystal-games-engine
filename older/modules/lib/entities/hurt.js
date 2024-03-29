import { Entity } from "../modules/core/entity.js";
import { Register } from "../modules/core/register.js";

/**
 *  This entity gives damage (through ig.Entity's receiveDamage() method) to
 * the entity that is passed as the first argument to the triggeredBy() method
 * (i.e you can connect an EntityTrigger to an EntityHurt to give damage to the
 * entity that activated the trigger).
 *
 * Keys for LevelEditor:
 * - damage:
 * Damage to give to the entity that triggered this entity.
 * Default: 10
 */
export class EntityHurt extends Entity {
  _levelEditorDrawBox = true;
  _levelEditorBoxColor = "rgba(255, 0, 0, 0.7)";

  size = { x: 8, y: 8 };
  damage = 10;

  triggeredBy(entity) {
    entity.receiveDamage(this.damage, this);
  }

  updatefunction() {}
}

Register.entityType(EntityHurt);
