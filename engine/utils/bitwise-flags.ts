type FlagsObject = Record<string, number>;

export class BitwiseFlags<TFlags extends FlagsObject> {
  flags: number;

  constructor() {
    this.flags = 0;
  }

  addFlag<TKey extends keyof TFlags>(flag: TFlags[TKey]) {
    this.flags |= flag;
  }

  removeFlag<TKey extends keyof TFlags>(flag: TFlags[TKey]) {
    this.flags &= ~flag;
  }

  hasFlag<TKey extends keyof TFlags>(flag: TFlags[TKey]) {
    return (this.flags & flag) === flag;
  }
}
