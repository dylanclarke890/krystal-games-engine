export class Health {
  maxHp;
  currentHp;

  /**
   * @param {number} maxHp - the maximum amount of health points the entity can have
   * @param {number} startingHp - the initial amount of health points the entity has
   */
  constructor(maxHp, startingHp) {
    this.maxHp = maxHp;
    this.currentHp = startingHp;
  }

  /**
   * Reduces the entity's health by the specified amount.
   * @param {number} amount - the amount to reduce the entity's health by.
   * @return {boolean} A flag indicating whether the damage killed the entity.
   */
  takeDamage(amount) {
    this.currentHp -= amount;
    if (this.currentHp <= 0) {
      this.currentHp = 0;
      return true;
    }
    return false;
  }

  /**
   * Increases the entity's health by the specified amount, up to the maximum health.
   * @param {number} amount - the amount to increase the entity's health by.
   * @param {boolean} canOverheal - if true, currentHp can exceed maxHp.
   */
  heal(amount, canOverheal) {
    this.currentHp += amount;
    if (!canOverheal && this.currentHp > this.maxHp) {
      this.currentHp = this.maxHp;
    }
  }

  /**
   * Checks if the entity is alive (has health points remaining).
   * @returns {boolean} - true if the entity is alive, false if it is dead
   */
  isAlive() {
    return this.currentHp > 0;
  }
}
