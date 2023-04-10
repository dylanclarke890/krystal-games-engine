export class Health {
  maxHp: number;
  currentHp: number;

  /**
   * @param maxHp - the maximum amount of health points the entity can have
   * @param startingHp - the initial amount of health points the entity has
   */
  constructor(maxHp: number, startingHp: number) {
    this.maxHp = maxHp;
    this.currentHp = startingHp;
  }

  /**
   * Reduces the entity's health by the specified amount.
   * @param amount - the amount to reduce the entity's health by.
   * @return A flag indicating whether the damage killed the entity.
   */
  takeDamage(amount: number): boolean {
    this.currentHp -= amount;
    if (this.currentHp <= 0) {
      this.currentHp = 0;
      return true;
    }
    return false;
  }

  /**
   * Increases the entity's health by the specified amount, up to the maximum health.
   * @param amount - the amount to increase the entity's health by.
   * @param canOverheal - if true, currentHp can exceed maxHp.
   */
  heal(amount: number, canOverheal: boolean) {
    this.currentHp += amount;
    if (!canOverheal && this.currentHp > this.maxHp) {
      this.currentHp = this.maxHp;
    }
  }

  /**
   * Checks if the entity is alive (has health points remaining).
   */
  isAlive(): boolean {
    return this.currentHp > 0;
  }
}
