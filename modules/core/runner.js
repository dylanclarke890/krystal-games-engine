import { PriorityLevel } from "../lib/data-structures/p-queue.js";

import { Entity } from "./entity.js";
import { EventSystem } from "./event-system.js";
import { GameLoop } from "./loop.js";
import { GameLoader, LoaderEvents } from "./loader.js";
import { MediaFactory } from "./media-factory.js";
import { SoundEvents, SoundManager } from "./sound.js";
import { System } from "./system.js";
import { GameLogger } from "../lib/utils/logger.js";

export class GameRunner {
  // Game Settings
  customGameOptions;
  fonts;
  game;
  newGameClass;
  ready;

  // Dependencies
  loop;
  mediaFactory;
  soundManager;
  system;

  constructor({
    canvasId,
    gameClass,
    fps,
    width,
    height,
    scale,
    loaderClass,
    debugMode,
    fonts = {},
    ...customGameOptions
  } = {}) {
    this.system = new System({ runner: this, canvasId, width, height, scale, fps });
    this.soundManager = new SoundManager();
    this.mediaFactory = new MediaFactory({ system: this.system, soundManager: this.soundManager });
    this.fonts = Object.entries(fonts).reduce((acc, [name, path]) => {
      acc[name] = this.mediaFactory.createFont({ name, path });
      return acc;
    }, {});
    this.customGameOptions = customGameOptions;

    this.bindEvents();
    this.ready = true;
    this.loadedInfo = { gameClass, debugMode, fps };
    new (loaderClass ?? GameLoader)(this.system);
  }

  bindEvents() {
    this.system.canvas.addEventListener(
      "pointerdown",
      () => EventSystem.dispatch(SoundEvents.UnlockWebAudio),
      {
        once: true,
        passive: true,
      }
    );

    EventSystem.on(
      LoaderEvents.LoadingComplete,
      () => {
        this.setGame(this.loadedInfo.gameClass);
        if (this.loadedInfo.debugMode) this.#launchDebugger();
      },
      PriorityLevel.Critical
    );
  }

  setGame(gameClass) {
    if (this.running) this.newGameClass = gameClass;
    else this.setGameNow(gameClass);
  }

  setGameNow(gameClass) {
    this.game = new gameClass({
      system: this.system,
      fonts: this.fonts,
      mediaFactory: this.mediaFactory,
      ...this.customGameOptions,
    });
    this.loop ??= new GameLoop(this.loadedInfo.fps);
    this.loop.start();
  }

  #launchDebugger() {
    GameLogger.debug("GameDebugger: Loading...");
    import("../debug/debug.js").then(({ GameDebugger }) => {
      this.gameDebugger = new GameDebugger({
        baseEntityClass: Entity,
        game: this.game,
        gameLoop: this.loop,
        system: this.system,
      });
    });
  }
}
