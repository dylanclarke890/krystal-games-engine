type Action = () => void;

export class Input {
  bindings: Map<string, Action>;

  constructor(bindings: Map<string, Action>) {
    this.bindings = bindings;
  }

  bind(name: string, action: Action) {
    this.bindings.set(name, action);
  }
}
