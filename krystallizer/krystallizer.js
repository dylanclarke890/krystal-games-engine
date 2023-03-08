import { Entity } from "../modules/core/entity.js";
import { EventSystem } from "../modules/core/event-system.js";
import { GameLoop, LoopEvents } from "../modules/core/loop.js";
import { MediaFactory } from "../modules/core/media-factory.js";
import { Register } from "../modules/core/register.js";

import { $el, loadImages, loadScript } from "../modules/lib/utils/dom.js";
import { noop } from "../modules/lib/utils/func.js";
import { Logger } from "../modules/lib/utils/logger.js";
import { formatAsJSON, hyphenToCamelCase } from "../modules/lib/utils/string.js";
import Sortable from "./third-party/sortable/src/Sortable.js";

import { SelectionBox } from "./tools/selection-box.js";
import { CommandManager } from "./tools/command-manager.js";
import { config } from "./config.js";
import { EditMap } from "./edit-map.js";
import { EditorActions, EditorEvents, InputEvents } from "./enums.js";
import { KrystallizerHttpClient } from "./http-client.js";
import { System } from "./system.js";
import { ConfirmModal, EntityDisplay, Panel, SelectLevelModal } from "./ui.js";
import { PriorityLevel } from "../modules/lib/data-structures/p-queue.js";

class ModeEvents {
  /**
   * @param {{
   * onModeEnter: () => void,
   * onMouseDown: () => void,
   * onMouseMove: () => void,
   * onMouseUp: () => void,
   * onModeLeave: () => void
   * }} events
   */
  constructor(events) {
    this.onModeEnter = events.onModeEnter ?? noop;
    this.onMouseDown = events.onMouseDown ?? noop;
    this.onMouseMove = events.onMouseMove ?? noop;
    this.onMouseUp = events.onMouseUp ?? noop;
    this.onModeLeave = events.onModeLeave ?? noop;
  }
}

export class Krystallizer {
  constructor() {
    this.system = new System();
    this.media = new MediaFactory({ system: this.system, noSound: true });
    this.loop = new GameLoop();
    this.logger = Logger.getInstance(config.logging.level);
    /** @type {EditMap[]} */
    this.layers = [];
    /** @type {"entities" | EditMap} */
    this.activeLayer;
    this.entities = [];
    this.entityClassesInfo = {};
    this.drawEntities = true;
    this.screen = { actual: { x: 0, y: 0 }, rounded: { x: 0, y: 0 } };
    this.mouse = { x: 0, y: 0, dx: 0, dy: 0 };
    this.inputState = {
      mouseIsDown: false,
      clicked: false,
      mouseDownTimer: null,
      objectBelowMouse: null,
      draggingCloneEntity: null,
      dragTarget: null,
    };
    this.currentAction = { onTransitionEnter: noop, onTransitionLeave: noop };
    this.setCurrentAction(); // Defaults to Cursor

    this.fileName = config.general.newFileName;
    this.discardChangesConfirmed = false;

    this.httpClient = new KrystallizerHttpClient();
    this.loadImagesAndEntities();

    this.DOMElements = {
      level: {
        load: $el("#level-load"),
        name: $el("#level-name"),
        new: $el("#level-new"),
        save: $el("#level-save"),
        saveAs: $el("#level-save-as"),
      },
      layers: $el("#layers-list"),
      layerActions: {
        apply: $el("#layer-apply"),
        delete: $el("#layer-delete"),
        new: $el("#layer-new"),
      },
      entities: $el("#entities"),
      entitiesLayer: {
        div: $el("#layer-entities"),
        visibility: $el("#layer-entities > .layer__visibility"),
      },
      entitySettings: {
        className: $el("#class-name"),
        div: $el("#entity-settings"),
        panelHeader: $el("#entity-settings .panel__header"),
        posX: $el("#pos-x"),
        posY: $el("#pos-y"),
      },
      entityActions: {
        apply: $el("#entity-apply"),
        delete: $el("#entity-delete"),
      },
      layerSettings: {
        div: $el("#layer-settings"),
        distance: $el("#distance"),
        height: $el("#dimensions-y"),
        isCollisionLayer: $el("#is-collision-layer"),
        linkWithCollision: $el("#link-with-collision"),
        name: $el("#name"),
        preRender: $el("#pre-render"),
        repeat: $el("#repeat-map"),
        tileset: $el("#tileset"),
        tilesize: $el("#tilesize"),
        width: $el("#dimensions-x"),
      },
      currentSelection: {
        div: document.querySelector("#current-selection"),
      },
      toolbar: {
        actions: document.querySelectorAll(".toolbar-icon"),
      },
      tooltips: document.querySelectorAll(".tooltip"),
    };
    this.panels = {
      entities: new Panel({ selector: this.DOMElements.entities }),
      entitySettings: new Panel({ selector: this.DOMElements.entitySettings.div }),
      layerSettings: new Panel({ selector: this.DOMElements.layerSettings.div }),
      currentSelection: new Panel({ selector: this.DOMElements.currentSelection.div }),
    };

    this.initTools();
    this.bindEvents();
    this.panels.entities.show();
    this.setModifiedState(false);
    this.loop.start();
  }

  //#region Initialising

  initTools() {
    this.selectionBox = new SelectionBox(
      this.system.ctx,
      this.panels.currentSelection,
      this.entities
    );
    this.commandManager = new CommandManager();
  }

  actions = {
    curs: new ModeEvents({ onModeEnter: () => this.setCanvasCursor("default") }),
    cursor: {
      onTransitionEnter: () => this.setCanvasCursor("default"),
      mouseDown: () => {
        this.setActiveEntity(this.inputState.objectBelowMouse);
        // Deselect deselectable things selected by other tools - probs could phrase this better :)
        if (this.inputState.objectBelowMouse === this.system.canvas) this.selectionBox.clear(false);
      },
      mouseMove: () => this.getObjectBelowMouse(true),
      mouseUp: noop,
      click: noop,
      onTransitionLeave: noop,
    },
    tileSelect: {
      onTransitionEnter: noop,
      mouseDown: noop,
      mouseMove: noop,
      mouseUp: noop,
      click: noop,
      onTransitionLeave: noop,
    },
    move: {
      onTransitionEnter: () => this.setCanvasCursor("move"),
      mouseDown: () => {
        this.inputState.dragTarget = this.getObjectBelowMouse(false);
        if (this.inputState.dragTarget === this.selectionBox) this.selectionBox.startMoving();
      },
      mouseMove: () => {
        const { dragTarget, mouseIsDown } = this.inputState;
        if (!mouseIsDown || !dragTarget) return;
        const { dx, dy } = this.mouse;

        if (dragTarget === this.system.canvas) this.scroll(dx, dy);
        else if (dragTarget === this.selectionBox) this.selectionBox.move(dx, dy);
        else {
          dragTarget.pos.x += dx;
          dragTarget.pos.y += dy;
        }
      },
      mouseUp: () => {
        if (this.inputState.dragTarget === this.selectionBox) this.selectionBox.endMoving();
        else this.selectionBox.getSelection();
        this.inputState.dragTarget = null;
      },
      click: noop,
      onTransitionLeave: noop,
    },
    select: {
      onTransitionEnter: () => {
        this.setCanvasCursor("crosshair");
        this.selectionBox.enterMode();
        this.panels.entitySettings.close();
        this.panels.entities.close();
      },
      mouseDown: () => {
        const x = this.screen.actual.x + this.mouse.x;
        const y = this.screen.actual.y + this.mouse.y;
        this.selectionBox.startSelection(x, y);
      },
      mouseMove: () => {
        if (!this.selectionBox.active || !this.selectionBox.isSelecting) return;
        this.selectionBox.updateSelectionRange(this.mouse.dx, this.mouse.dy);
      },
      mouseUp: () => this.selectionBox.endSelection(),
      click: () => this.selectionBox.clear(false),
      onTransitionLeave: () => {
        this.selectionBox.leaveMode();
        this.setCanvasCursor("default");
      },
    },
    eraser: {
      onTransitionEnter: noop,
      mouseDown: noop,
      mouseMove: noop,
      mouseUp: noop,
      click: noop,
      onTransitionLeave: noop,
    },
    shape: {
      onTransitionEnter: noop,
      mouseDown: noop,
      mouseMove: noop,
      mouseUp: noop,
      click: noop,
      onTransitionLeave: noop,
    },
  };

  setCurrentAction(action) {
    this.currentAction.onTransitionLeave();
    this.currentAction = this.actions[action ?? "cursor"];
    this.currentAction.onTransitionEnter();
  }

  getObjectBelowMouse(setCursor) {
    if (this.inputState.draggingCloneEntity) return;
    const sx = this.screen.actual.x;
    const sy = this.screen.actual.y;
    const p = { x: this.mouse.x + sx, y: this.mouse.y + sy };
    let found = null;
    found = this.entities.find(
      (e) =>
        p.x >= e.pos.x && p.x <= e.pos.x + e.size.x && p.y >= e.pos.y && p.y <= e.pos.y + e.size.y
    );

    if (!found && this.selectionBox.isPointWithinSelection(p.x, p.y)) {
      found = this.selectionBox;
    }

    // keep this here; don't want a pointer cursor just for being over the canvas.
    if (setCursor) this.setCanvasCursor(found ? "pointer" : "default");

    found ??= this.system.canvas;
    this.inputState.objectBelowMouse = found;
    return found;
  }

  bindEventSystemListeners() {
    EventSystem.on(LoopEvents.NextFrame, (tick) => this.nextFrame(tick), PriorityLevel.Critical);
    EventSystem.on(
      EditorActions.EntityDragStart,
      (e) => (this.inputState.draggingCloneEntity = e),
      PriorityLevel.High
    );
    EventSystem.on(
      EditorActions.EntityDragEnd,
      () => (this.inputState.draggingCloneEntity = null),
      PriorityLevel.High
    );
  }

  bindMouseEvents() {
    EventSystem.on(
      InputEvents.MouseMove,
      (mouse) => this.handleMouseMove(mouse),
      PriorityLevel.High
    );
    this.system.canvas.addEventListener("pointerdown", () => {
      this.inputState.mouseIsDown = true;
      this.inputState.clicked = true;
      this.inputState.mouseDownTimer = setTimeout(() => (this.inputState.clicked = false), 150);
      this.handleMouseDown();
    });
    document.addEventListener("pointerup", () => {
      const { mouseIsDown, mouseDownTimer, clicked } = this.inputState;
      if (!mouseIsDown) return; // Canvas wasn't source of click
      clearTimeout(mouseDownTimer);

      this.handleMouseUp();
      if (clicked) this.handleClick();

      this.inputState.mouseDownTimer = null;
      this.inputState.mouseIsDown = false;
      this.inputState.clicked = false;
    });
  }

  bindEvents() {
    this.bindEventSystemListeners();
    this.bindMouseEvents();

    const {
      layers,
      level,
      layerActions,
      entityActions,
      entitiesLayer,
      layerSettings,
      toolbar,
      tooltips,
    } = this.DOMElements;

    toolbar.actions.forEach((action) => {
      action.addEventListener("click", () => {
        toolbar.actions.forEach((a) => a.classList.toggle("active", a === action));
        this.setCurrentAction(action.getAttribute("data-action"));
      });
    });

    tooltips.forEach((tooltip) => {
      const child = tooltip.querySelector("img");
      child.addEventListener("mouseover", () => {
        tooltip.classList.add("open");
      });
      child.addEventListener("mouseout", () => {
        tooltip.classList.remove("open");
      });
    });

    const toggleDraggingClass = (is) => document.documentElement.classList.toggle("dragging", is);
    new Sortable(layers, {
      filter: ".layer__visibility", // Selectors that do not lead to dragging
      onUpdate: () => this.reorderLayers(),
      onStart: () => toggleDraggingClass(true),
      onEnd: () => toggleDraggingClass(false),
      animation: 150,
      delay: 50,
      forceFallback: true,
    });

    level.new.addEventListener("click", () => this.newLevel());
    level.save.addEventListener("click", () => {
      if (this.fileName === config.general.newFileName) {
        this.modals.saveAs.open();
        return;
      }
      this.saveLevel(this.filePath + this.fileName);
    });

    layerActions.new.addEventListener("click", () => this.addLayer());
    layerActions.apply.addEventListener("click", () => this.saveLayerSettings());
    layerActions.delete.addEventListener("click", () => {
      if (!config.general.confirmDeleteLayer) this.removeLayer();
    });

    entityActions.apply.addEventListener("click", () => this.saveEntitySettings());
    entityActions.delete.addEventListener("click", () => {
      if (!config.general.confirmDeleteEntity) this.removeEntity();
    });

    const { div, visibility } = entitiesLayer;
    div.addEventListener("click", () => this.setActiveLayer("entities"));
    visibility.addEventListener("click", () => {
      this.drawEntities = !this.drawEntities;
      visibility.dataset.checked = (!this.drawEntities).toString();
    });

    const { isCollisionLayer } = layerSettings;
    isCollisionLayer.addEventListener("change", () => this.updateCollisionLayerSettings());
  }

  /**
   * Load all images before initialising any modals. This is to prevent blank screens from
   * being drawn for the level previews.
   * @param {string[]} paths
   */
  preloadImages(paths) {
    if (!paths.some((p) => p === config.collisionTiles.path)) {
      this.logger.debug("preloadImages: Appending collision tiles path...");
      paths.push(config.collisionTiles.path);
    }

    loadImages(paths)
      .then(() => {
        this.logger.debug(`preloadImages: ${paths.length} images loaded.`);
        this.initModals();
      })
      .catch((err) => this.logger.critical(err));
  }

  /**
   * Load all game assets and entities.
   */
  loadImagesAndEntities() {
    const { images, entities } = config.directories;
    const getImages = this.httpClient.api.browse(images, "images");
    const getEntities = this.httpClient.api.glob(entities);
    Promise.all([getImages, getEntities])
      .then(([imagesResult, entitiesResult]) => {
        this.preloadImages(imagesResult);
        this.loadEntityScripts(entitiesResult);
      })
      .catch((err) => this.logger.error(`Error occurred during loading: ${err}`));
  }

  initModals() {
    const saveAs = new ConfirmModal({
      id: "modal-save-as",
      size: "sm",
      title: "Save As",
      body: "<input name='new-file-name' id='new-file-name'/>",
      triggeredBy: [this.DOMElements.level.saveAs],
      onOpen: () => {
        const fileNameInput = $el("#new-file-name");
        fileNameInput.value = this.fileName;
        fileNameInput.focus();
        fileNameInput.setSelectionRange(0, fileNameInput.value.lastIndexOf(".js"));
        fileNameInput.addEventListener("keyup", (e) => {
          if (e.key === "Enter") {
            saveAs.events.ok();
            saveAs.close();
          }
        });
      },
      onOk: () => {
        let dir = config.directories.levels;
        if (dir[dir.length - 1] !== "/") dir += "/";
        this.saveLevel(`${dir}${$el("#new-file-name").value}`);
      },
    });
    const confirmDeleteLayer = new ConfirmModal({
      id: "modal-delete-layer",
      title: "Delete Layer?",
      body: "<p class='text-center'>Are you sure you wish to delete this layer?</p>",
      triggeredBy: [this.DOMElements.layerActions.delete],
      onOk: () => this.removeLayer(),
    });
    const confirmDeleteEntity = new ConfirmModal({
      id: "modal-delete-entity",
      title: "Delete Entity?",
      body: "<p class='text-center'>Are you sure you wish to delete this entity?</p>",
      triggeredBy: [this.DOMElements.entityActions.delete],
      onOk: () => this.removeEntity(),
    });
    const confirmDiscard = new ConfirmModal({
      id: "modal-discard-changes",
      title: "Discard Changes?",
      body: "<p class='text-center'>You have unsaved changes, which will be lost if you continue. Start a new file?</p>",
      triggeredBy: [this.DOMElements.level.new],
      onOpen: () => {
        if (!this.modified) confirmDiscard.close();
      },
      onOk: () => {
        this.discardChangesConfirmed = true;
        this.newLevel();
      },
    });
    const levelSelect = new SelectLevelModal(
      {
        id: "modal-load-level",
        triggeredBy: [this.DOMElements.level.load],
        onSelect: (lvl) => lvl && this.loadLevel(lvl),
        onLevelsLoaded: (levels) => {
          if (!config.general.loadLastLevel) return;

          let lastLevelPath = localStorage.getItem(config.storageKeys.lastLevel);
          if (!lastLevelPath) return;
          if (lastLevelPath.startsWith("..")) lastLevelPath = lastLevelPath.slice(2);

          const level = levels.find((l) => l.path === lastLevelPath);
          if (!level) return;
          this.loadLevel(level);
        },
      },
      this.httpClient
    );
    this.modals = {
      saveAs,
      levelSelect,
      confirmDiscard: config.general.confirmDiscardChanges && confirmDiscard,
      confirmDeleteLayer: config.general.confirmDeleteLayer && confirmDeleteLayer,
      confirmDeleteEntity: config.general.confirmDeleteEntity && confirmDeleteEntity,
    };
  }

  //#endregion Initialising

  //#region Drawing

  drawEntityLayer() {
    if (!this.drawEntities) return;
    for (let i = 0; i < this.entities.length; i++) this.entities[i].draw();
  }

  drawLabels() {
    const { ctx, height, width, scale } = this.system;
    const { colors, labels } = config;
    const { actual } = this.screen;

    ctx.fillStyle = colors.primary;
    const { step, markerLength, markerWidth } = labels;

    let xlabel = actual.x - (actual.x % step) - step;
    for (let tx = Math.floor(-actual.x % step); tx < width; tx += step) {
      xlabel += step;
      ctx.fillText(xlabel, tx * scale, 10);
    }

    let ylabel = actual.y - (actual.y % step) - step;
    for (let ty = Math.floor(-actual.y % step); ty < height; ty += step) {
      ylabel += step;
      ctx.fillText(ylabel, 2, ty * scale + 10);
    }

    ctx.lineWidth = markerWidth;
    ctx.beginPath();
    ctx.moveTo(this.mouse.x, 0);
    ctx.lineTo(this.mouse.x, markerLength);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, this.mouse.y);
    ctx.lineTo(markerLength, this.mouse.y);
    ctx.stroke();
  }

  clear() {
    const { ctx, height, width } = this.system;
    const clearColor = config.colors.clear;
    if (clearColor) {
      ctx.fillStyle = clearColor;
      ctx.fillRect(0, 0, width, height);
    } else ctx.clearRect(0, 0, width, height);
  }

  draw() {
    this.clear();

    let entitiesDrawn = false;
    for (let i = 0; i < this.layers.length; i++) {
      const layer = this.layers[i];
      // If layer is a foreground layer, draw entities first.
      if (!entitiesDrawn && layer.foreground) {
        entitiesDrawn = true;
        this.drawEntityLayer();
      }
      layer.draw();
    }
    if (!entitiesDrawn) this.drawEntityLayer();
    if (config.labels.draw) this.drawLabels();
    this.selectionBox.draw(this.screen);
  }

  //#endregion Drawing

  //#region Events

  nextFrame(tick) {
    this.system.tick = tick;
    this.draw();
  }

  setModifiedState(/** @type {boolean} */ isModified) {
    this.modified = isModified;
    document.title = `${this.fileName}${isModified ? "*" : ""} | Krystallizer`;
    const levelName = this.DOMElements.level.name;
    levelName.textContent = this.fileName;
    levelName.dataset.unsaved = isModified;
  }

  handleMouseDown() {
    this.currentAction?.mouseDown();
  }

  handleMouseMove(mouse) {
    this.mouse = { ...mouse };
    this.currentAction?.mouseMove();
  }

  handleMouseUp() {
    this.currentAction?.mouseUp();
  }

  handleClick() {
    this.currentAction?.click();
  }

  scroll(x, y) {
    const scale = this.system.scale;
    const { actual, rounded } = this.screen;
    actual.x -= x;
    actual.y -= y;
    rounded.x = Math.round(actual.x * scale) / scale;
    rounded.y = Math.round(actual.y * scale) / scale;
    for (let i = 0; i < this.layers.length; i++) this.layers[i].setScreenPos(actual.x, actual.y);
  }

  setCanvasCursor(cursor) {
    this.system.canvas.style.cursor = cursor;
  }

  /**
   * @param {string} className
   * @param {{x: number, y: number}} pos
   */
  onEntityDrop(className, pos) {
    // Sync the current position of the entity to spawn with it's position on the canvas.
    const bounds = this.system.canvas.getBoundingClientRect();
    const screen = this.screen.actual;
    const x = Math.round(pos.x - bounds.x + screen.x);
    const y = Math.round(pos.y - bounds.y + screen.y);
    this.setActiveEntity(this.spawnEntity(className, x, y));
    this.setModifiedState(true);
    this.selectionBox.getSelection();
  }

  //#endregion Events

  //#region Entity

  setActiveEntity(entity) {
    const { entitySettings } = this.panels;

    const validEntity = entity && entity instanceof Entity;
    entitySettings.toggleVisible(validEntity);

    if (!validEntity) {
      this.selectedEntity = null;
      return;
    }

    const { className, posX, posY } = this.DOMElements.entitySettings;
    this.selectedEntity = entity;

    className.value = entity.constructor.name;
    posX.value = entity.pos.x;
    posY.value = entity.pos.y;
  }

  loadEntityScripts(entitiesData) {
    let totalScriptsToLoad = Object.keys(entitiesData).length;
    const scriptLoadCb = () => {
      if (--totalScriptsToLoad <= 0) this.importEntities(entitiesData);
    };
    for (let filepath in entitiesData) loadScript({ src: filepath, cb: scriptLoadCb });
  }

  importEntities(entitiesData) {
    const invalidClasses = [];
    const entityClasses = {};

    for (const filepath in entitiesData) {
      entitiesData[filepath].forEach((className) => {
        const classDef = Register.getEntityByType(className);
        if (classDef && !classDef.prototype._levelEditorIgnore) {
          entityClasses[className] = { filepath };
        } else {
          invalidClasses.push(className);
        }
      });
    }

    if (invalidClasses.length > 0) this.logInvalidClasses(invalidClasses);
    this.entityClassesInfo = entityClasses;
    this.constructEntitiesList();
  }

  logInvalidClasses(invalidClasses) {
    this.logger.warn(`
    Entity class definitions could not be fetched. Please ensure you've correctly registered the entity type by calling:
    Register.entityType(classDefinition) or
    Register.entityTypes(...classDefinitions).
    The following class definitions could not be found:
    ${invalidClasses.join("\n")}
  `);
  }

  constructEntitiesList() {
    const classes = Object.keys(this.entityClassesInfo);
    const entityDisplays = [];
    for (let i = 0; i < classes.length; i++) {
      const className = classes[i];
      const classDef = Register.getEntityByType(className);
      const entityInfo = this.entityClassesInfo[className];
      const spawned = new classDef({ x: 0, y: 0, game: this });
      entityDisplays.push(
        new EntityDisplay(spawned, { ...entityInfo, className }, (cn, pos) =>
          this.onEntityDrop(cn, pos)
        )
      );
    }
  }

  /** @returns {import("../modules/core/entity.js").Entity} */
  spawnEntity(className, x, y, settings = {}) {
    const entityClass = Register.getEntityByType(className);
    if (!entityClass) return null;
    const newEntity = new entityClass({ x, y, game: this, settings });
    newEntity._additionalSettings = structuredClone(settings);
    this.entities.push(newEntity);
    if (settings.name) this.namedEntities[settings.name] = newEntity;
    return newEntity;
  }

  removeEntity() {
    if (!this.selectedEntity) return;

    const eIndex = this.entities.indexOf(this.selectedEntity);
    if (eIndex === -1)
      throw new Error("Unable to find selected entity: " + JSON.stringify(this.selectedEntity));
    this.entities.splice(eIndex, 1);
    EventSystem.dispatch(EditorEvents.EntityDeleted, this.selectedEntity);

    this.setActiveEntity(null);
    this.setModifiedState(true);
  }

  saveEntitySettings() {
    if (!this.selectedEntity) return;
    this.setModifiedState(true);
  }

  //#endregion Entity

  //#region Level

  clearLevel() {
    this.layers.forEach((l) => l.destroy());
    this.layers = [];
    this.screen = { actual: { x: 0, y: 0 }, rounded: { x: 0, y: 0 } };
    this.entities.length = 0;
    this.commandManager.clear();
    localStorage.removeItem(config.storageKeys.lastLevel);
    this.setActiveLayer("entities");
  }

  newLevel() {
    if (this.modified && this.modals.confirmDiscard && !this.discardChangesConfirmed) return;
    this.clearLevel();
    this.fileName = config.general.newFileName;
    this.filePath = config.directories.levels + this.fileName;
    this.setModifiedState(false);
    this.discardChangesConfirmed = false;
  }

  /**
   * @param {{ path:string, data: {entities: any[], layer: any[]} }}
   */
  loadLevel({ path, data } = {}) {
    if (!data || !path) return;
    this.clearLevel();

    const split = path.lastIndexOf("/");
    this.filePath = path.substring(0, split + 1);
    this.fileName = path.substring(split + 1);
    this.setModifiedState(false);
    localStorage.setItem(config.storageKeys.lastLevel, path);

    for (let i = 0; i < data.entities.length; i++) {
      const { type, x, y, settings } = data.entities[i];
      this.spawnEntity(type, x, y, settings);
    }

    for (let i = 0; i < data.layer.length; i++) {
      const layer = data.layer[i];
      const newLayer = new EditMap({
        name: layer.name,
        tilesize: layer.tilesize,
        tileset: layer.tilesetName || layer.tileset,
        foreground: !!layer.foreground,
        system: this.system,
        config,
        editor: this,
      });
      newLayer.resize(layer.width || layer.data[0].length, layer.height || layer.data.length);
      newLayer.linkWithCollision = layer.linkWithCollision;
      newLayer.repeat = layer.repeat;
      newLayer.preRender = !!layer.preRender;
      newLayer.distance = layer.distance;
      newLayer.visible = !layer.visible;
      newLayer.data = layer.data;
      newLayer.toggleVisibility();
      this.layers.push(newLayer);

      if (layer.name === "collision") this.collisionLayer = newLayer;
      this.setActiveLayer(layer.name);
    }

    this.setActiveLayer("entities");
    this.reorderLayers();
    this.setModifiedState(false);
  }

  saveLevel(path) {
    if (!path.match(/\.js$/)) path += ".js";

    this.filePath = path;
    this.fileName = path.replace(/^.*\//, "");

    const data = {
      entities: this.entities.map((e) => ({
        ...e.pos,
        type: e.constructor.name,
        settings: e._additionalSettings ?? {},
      })),
      layer: this.layers.map((l) => l.getSaveData()),
    };

    let dataString = JSON.stringify(data);
    if (config.general.prettyPrint) dataString = formatAsJSON(dataString);
    const levelName = hyphenToCamelCase(this.fileName.substring(0, this.fileName.lastIndexOf(".")));
    dataString = `export const ${levelName} = /*JSON-BEGIN*/ ${dataString}; /*JSON-END*/`;

    this.httpClient.api
      .save(path, dataString)
      .then((res) => {
        if (res.error) {
          this.logger.error(res.msg);
          return;
        }
        this.setModifiedState(false);
        localStorage.setItem(config.storageKeys.lastLevel, path);
      })
      .catch((err) => this.logger.error(err));
  }

  //#endregion Level

  //#region Layers

  setActiveLayer(/** @type {string} */ name) {
    const isEntityLayer = name === "entities";
    const activeClass = "layer-active";
    const { entitiesLayer } = this.DOMElements;
    entitiesLayer.div.classList.toggle(activeClass, isEntityLayer);

    this.activeLayer = isEntityLayer ? name : this.getLayerByName(name);
    if (!isEntityLayer) this.panels.entitySettings.hide();
    this.panels.entities.toggleVisible(isEntityLayer);
    this.panels.layerSettings.toggleVisible(!isEntityLayer);

    for (let i = 0; i < this.layers.length; i++) {
      const layer = this.layers[i];
      layer.DOMElements.div.classList.toggle(activeClass, layer.name === name);
    }
    this.updateLayerSettings();
  }

  reorderLayers() {
    const layers = document.querySelectorAll(".layer__name");
    const newLayers = [];
    let isForegroundLayer = true;
    layers.forEach((el, i) => {
      const name = el.textContent;
      const hotkey = i + 1;

      if (name === "entities") {
        isForegroundLayer = false; // All layers after the entity layer are not foreground layers
        this.DOMElements.entitiesLayer.div.title = `Select Layer (${hotkey})`;
        this.DOMElements.entitiesLayer.visibility.title = `Toggle Visibility (Shift+${hotkey})`;
        return;
      }

      const layer = this.getLayerByName(name);
      if (!layer) return;
      layer.setHotkey(hotkey);
      layer.foreground = isForegroundLayer;
      newLayers.unshift(layer);
    });

    this.layers = newLayers;
    this.setModifiedState(true);
  }

  getLayerByName(/** @type {string} */ name) {
    return this.layers.find((layer) => layer.name === name);
  }

  addLayer() {
    const name = "new_layer_" + this.layers.length;
    const newLayer = new EditMap({
      config,
      editor: this,
      name,
      system: this.system,
      tilesize: config.layerDefaults.tilesize,
    });

    newLayer.resize(config.layerDefaults.width, config.layerDefaults.height);
    newLayer.setScreenPos(this.screen.actual.x, this.screen.actual.y);

    this.layers.push(newLayer);
    this.setActiveLayer(name);
    this.updateLayerSettings();
    this.reorderLayers();
  }

  removeLayer() {
    if (this.activeLayer === "entities") return false;
    const name = this.activeLayer.name;
    this.activeLayer.destroy();
    for (let i = 0; i < this.layers.length; i++) {
      if (this.layers[i].name !== name) continue;
      this.layers.splice(i, 1);
      this.reorderLayers();
      this.setActiveLayer("entities");
      return true;
    }
    return false;
  }

  updateLayerSettings() {
    if (this.activeLayer === "entities") return;
    const {
      name,
      tileset,
      tilesize,
      width,
      height,
      distance,
      preRender,
      repeat,
      linkWithCollision,
      isCollisionLayer,
    } = this.DOMElements.layerSettings;

    name.value = this.activeLayer.name;
    tileset.value = this.activeLayer.tilesetName;
    tilesize.value = this.activeLayer.tilesize ?? 32;
    width.value = this.activeLayer.width ?? 10;
    height.value = this.activeLayer.height ?? 10;
    distance.value = this.activeLayer.distance ?? 1;
    preRender.checked = this.activeLayer.preRender;
    repeat.checked = this.activeLayer.repeat;
    linkWithCollision.checked = this.activeLayer.linkWithCollision;
    isCollisionLayer.checked = this.activeLayer === this.collisionLayer;
    this.updateCollisionLayerSettings();
  }

  updateCollisionLayerSettings() {
    const { isCollisionLayer, name, tileset, distance, preRender, repeat, linkWithCollision } =
      this.DOMElements.layerSettings;
    // only collision-specific inputs should be enabled if 'isCollisionLayer' is checked.
    [name, tileset, distance, preRender, repeat, linkWithCollision].forEach(
      (el) => (el.disabled = isCollisionLayer.checked)
    );
  }

  saveLayerSettings() {
    if (this.activeLayer === "entities") return;

    const { isCollisionLayer, name, width, height, tilesize } = this.DOMElements.layerSettings;
    const isCollision = isCollisionLayer.checked;
    const newName = isCollision ? "collision" : name.value;
    const newWidth = Math.floor(width.value);
    const newHeight = Math.floor(height.value);
    if (newWidth !== this.activeLayer.width || newHeight !== this.activeLayer.height)
      this.activeLayer.resize(newWidth, newHeight);
    this.activeLayer.tilesize = Math.floor(tilesize.value);

    if (isCollision) {
      this.activeLayer.linkWithCollision = false;
      this.activeLayer.distance = 1;
      this.activeLayer.repeat = false;
      this.activeLayer.setCollisionTileset();
    } else {
      const { tileset, linkWithCollision, distance, repeat, preRender } =
        this.DOMElements.layerSettings;
      const newTilesetName = tileset.value;
      if (newTilesetName !== this.activeLayer.tilesetName)
        this.activeLayer.setTileset(newTilesetName);
      this.activeLayer.distance = parseFloat(distance.value);
      this.activeLayer.linkWithCollision = linkWithCollision.checked;
      this.activeLayer.repeat = repeat.checked;
      this.activeLayer.preRender = preRender.checked;
    }

    // Is a collision layer
    if (newName === "collision") this.collisionLayer = this.activeLayer;
    // Was a collision layer, but is no more
    else if (this.activeLayer.name === "collision") this.collisionLayer = undefined;

    this.activeLayer.setName(newName);
    this.setModifiedState(true);
  }

  //#endregion Layers
}
