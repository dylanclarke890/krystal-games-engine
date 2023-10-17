import { InputStatus } from "../../types/common-types.js";
import { UserAgent } from "../../utils/user-agent.js";
import { InputKey } from "../input-keys.js";

export abstract class BaseInputHandler {
  agent: UserAgent;
  actions: Map<string, InputStatus>;
  bindings: Map<InputKey, string>;
  hasInitialised: boolean;

  constructor(agent: UserAgent, actions: Map<string, InputStatus>, bindings: Map<InputKey, string>) {
    this.agent = agent;
    this.actions = actions;
    this.bindings = bindings;
    this.hasInitialised = false;
  }

  abstract init(): void;

  getStatusByInputKey(key: InputKey): Nullable<InputStatus> {
    const action = this.bindings.get(key);
    if (typeof action === "undefined") {
      return undefined;
    }

    return this.actions.get(action);
  }
}
