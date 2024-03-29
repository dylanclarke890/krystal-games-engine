import { PriorityLevel } from "../lib/data-structures/p-queue.js";

import { Entity } from "./entity.js";
import { EventSystem, GameEvents } from "./event-system.js";
import { GameLoop } from "./time/game-loop.js";
import { GameLoader } from "./loader.js";
import { MediaFactory } from "./media-factory.js";
import { SoundManager } from "./assets/sound.js";
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
  media;
  sound;
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
    this.sound = new SoundManager();
    this.media = new MediaFactory({ system: this.system, soundManager: this.sound });
    this.fonts = Object.entries(fonts).reduce((acc, [name, path]) => {
      acc[name] = this.media.createFont({ name, path });
      return acc;
    }, {});
    this.customGameOptions = customGameOptions;

    this.bindEvents();
    this.onReady();

    this.loadedInfo = { gameClass, debugMode, fps };
    new (loaderClass ?? GameLoader)(this.system);
  }

  onReady() {
    this.ready = true;
    EventSystem.dispatch(GameEvents.System_ReadyToLoad);
  }

  bindEvents() {
    this.system.canvas.addEventListener(
      "pointerdown",
      () => EventSystem.dispatch(GameEvents.Sound_UnlockWebAudio),
      {
        once: true,
        passive: true,
      }
    );

    EventSystem.on(
      GameEvents.System_PreloadingComplete,
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
      mediaFactory: this.media,
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
