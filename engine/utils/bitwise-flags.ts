export class BitwiseFlags<TFlags extends Record<string, number>> {
  flags: number;

  constructor() {
    this.flags = 0;
  }

  add<TKey extends keyof TFlags>(flag: TFlags[TKey]) {
    this.flags |= flag;
  }

  remove<TKey extends keyof TFlags>(flag: TFlags[TKey]) {
    this.flags &= ~flag;
  }

  has<TKey extends keyof TFlags>(flag: TFlags[TKey]) {
    return (this.flags & flag) === flag;
  }

  clear() {
    this.flags = 0;
  }

  isSet() {
    return this.flags !== 0;
  }
}
