export class BitwiseFlags {
  flags: number;

  constructor() {
    this.flags = 0;
  }

  addFlag(flag: number) {
    this.flags |= flag;
  }

  removeFlag(flag: number) {
    this.flags &= ~flag;
  }

  hasFlag(flag: number) {
    return (this.flags & flag) === flag;
  }
}
