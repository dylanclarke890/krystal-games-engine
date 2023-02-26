import { config } from "../../../krystallizer/config.js";

export class Logger {
  static #levels = {
    critical: { lvl: 0, prefix: "[CRITICAL]", color: "darkred", background: "red" },
    error: { lvl: 1, prefix: "[ERROR]", color: "darkred", background: "lightcoral" },
    warn: { lvl: 2, prefix: "[WARN]", color: "orangered", background: "orange" },
    info: { lvl: 3, prefix: "[INFO]", color: "blue", background: "lightblue" },
    debug: { lvl: 4, prefix: "[DEBUG]", color: "green", background: "lightgreen" },
  };

  /** @type {Logger} */
  static #instance;
  static #enabled = config.logging.enabled;
  static #showTimestamp = config.logging.showTimestamp;

  static getInstance(level) {
    if (this.#instance) {
      if (level) this.#instance.setLevel(level);
      return this.#instance;
    }

    this.#instance = new Logger(level);
    return this.#instance;
  }

  /**
   * @param {[string]} initialLevel
   */
  constructor(initialLevel = "info") {
    this.setLevel(initialLevel);
  }

  log(level, ...args) {
    if (!Logger.#enabled) return;
    if (!(level in Logger.#levels)) return;
    if (Logger.#levels[level].lvl > Logger.#levels[this.level].lvl) return;
    const { prefix, color, background } = Logger.#levels[level];
    const message = Logger.#showTimestamp ? `%c${prefix} - T:${performance.now()}` : `%c${prefix}`;
    const colorStyle = color ? `color: ${color}` : "";
    const bgStyle = background ? `background: ${background}` : "";
    const style = `${colorStyle};${bgStyle};`;
    console.log(message, style, ...args);
  }

  critical(...args) {
    this.log("critical", ...args);
  }

  error(...args) {
    this.log("error", ...args);
  }

  warn(...args) {
    this.log("warn", ...args);
  }

  info(...args) {
    this.log("info", ...args);
  }

  debug(...args) {
    this.log("debug", ...args);
  }

  setLevel(level) {
    if (!(level in Logger.#levels)) throw new Error(`Invalid logging level '${level}'`);
    this.level = level;
  }
}
