export class BitwiseFlags<T extends number> {
  flags: number;

  constructor() {
    this.flags = 0;
  }

  add(flag: T) {
    this.flags |= flag;
  }

  remove(flag: T) {
    this.flags &= ~flag;
  }

  has(flag: T) {
    return (this.flags & flag) === flag;
  }

  clear() {
    this.flags = 0;
  }

  isSet() {
    return this.flags !== 0;
  }
}
