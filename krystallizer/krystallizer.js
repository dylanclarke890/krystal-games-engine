import { GameLoop } from "../modules/core/loop.js";
import { Register } from "../modules/core/register.js";
import { $el, loadImages, loadScript } from "../modules/lib/utils/dom.js";
import { Logger } from "../modules/lib/utils/logger.js";
import { formatAsJSON, hyphenToCamelCase } from "../modules/lib/utils/string.js";
import { Canvas } from "./canvas.js";
import { config } from "./config.js";
import { EditMap } from "./edit-map.js";
import { KrystallizerHttpClient } from "./http-client.js";
import { System } from "./system.js";
import { ConfirmModal, EntityDisplay, SelectLevelModal } from "./ui.js";
import { Undo } from "./undo.js";
import Sortable from "./third-party/sortable/src/Sortable.js";
import { EventSystem, LoopEvents } from "../modules/core/events.js";
import { MediaFactory } from "../modules/core/media-factory.js";
import { InputEvents } from "./enums.js";

export class Krystallizer {
  constructor() {
    this.system = new System();
    this.canvas = new Canvas(this.system);
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
    this.mouse = { x: 0, y: 0 };

    const { undoDepth, newFileName } = config.general;
    this.undo = new Undo({ editor: this, levels: undoDepth });
    this.fileName = newFileName;
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
      toolbar: {
        actions: document.querySelectorAll(".toolbar-icon"),
      },
    };
    this.setModifiedState(false);
    this.bindEvents();
    this.loop.start();
  }

  bindPanelEvents() {
    const panels = document.querySelectorAll("#collapsible-panels > .panel");
    for (let i = 0; i < panels.length; i++) {
      const panel = panels[i];
      const content = panel.querySelector(".panel__content");
      const header = panel.querySelector(".panel__header");
      const toggle = panel.querySelector(".panel__toggle-icon");
      header.addEventListener("click", () => {
        if (content.classList.contains("open")) {
          content.classList.remove("open");
          toggle.dataset.direction = "right";
        } else {
          content.classList.add("open");
          toggle.dataset.direction = "down";
        }
      });
      // Start with the entities list panel open
      if (panel.id === "entities") header.dispatchEvent(new Event("click"));
    }
  }

  bindEvents() {
    EventSystem.on(LoopEvents.NextFrame, (tick) => this.nextFrame(tick));
    EventSystem.on(InputEvents.MouseMove, (mouse) => this.handleMouseMovement(mouse));
    this.system.canvas.addEventListener("mousedown", () => (this.mouseIsDown = true));
    document.addEventListener("mousedown", () => (this.mouseIsDown = false));
    this.bindPanelEvents();

    const { layers, level, layerActions, entityActions, entitiesLayer, layerSettings, toolbar } =
      this.DOMElements;

    toolbar.actions.forEach((action) => {
      action.addEventListener("click", () => {
        toolbar.actions.forEach((a) => a.classList.toggle("active", a === action));
        this.toolbarAction(action.getAttribute("data-action"));
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

  handleMouseMovement(mouse) {
    this.mouse = { ...mouse };
    const p = mouse;

    this.hoveredEntity = this.entities.find(
      (e) =>
        p.x >= e.pos.x && p.x <= e.pos.x + e.size.x && p.y >= e.pos.y && p.y <= e.pos.y + e.size.y
    );

    let cursor;
    if (this.hoveredEntity) cursor = "pointer";
    else if (this.currentToolbarAction === "move") cursor = "move";
    else cursor = "default";
    this.system.canvas.style.cursor = cursor;
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

  drawEntityLayer() {
    if (!this.drawEntities) return;
    for (let i = 0; i < this.entities.length; i++) this.entities[i].draw();
  }

  draw() {
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
  }

  nextFrame(tick) {
    this.system.tick = tick;
    this.canvas.draw();
    this.draw();
  }

  toolbarAction(action) {
    this.logger.info(action);
    this.currentToolbarAction = action;
    switch (action) {
      case "default":
        break;
      case "move": {
        if (!this.mouseIsDown) break;
        const dx = this.system.mouse.x - this.system.mouseLast.x,
          dy = this.system.input.mouse.y - this.system.mouseLast.y;
        break;
      }

      default:
        break;
    }
  }

  //#region Entity

  setActiveEntity(entity) {
    const { panelHeader, div } = this.DOMElements.entitySettings;
    div.style.display = entity ? "block" : "none";
    this.selectedEntity = entity;

    if (!entity) {
      panelHeader.dispatchEvent(new Event("click"));
      return;
    }

    const { className, posX, posY } = this.DOMElements.entitySettings;
    panelHeader.dispatchEvent(new Event("click"));
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

  /**
   * @param {string} className
   * @param {{x: number, y: number}} pos
   */
  onEntityDrop(className, pos) {
    // Sync the current position of the entity to spawn with it's position on the canvas.
    const bounds = this.system.canvas.getBoundingClientRect();
    this.setActiveEntity(
      this.spawnEntity(className, Math.round(pos.x - bounds.x), Math.round(pos.y - bounds.y))
    );
    this.setModifiedState(true);
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
    this.entities = this.entities.filter((e) => e !== this.selectedEntity);
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
    this.entities = [];
    this.undo.clear();
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

  setModifiedState(/** @type {boolean} */ isModified) {
    this.modified = isModified;
    document.title = `${this.fileName}${isModified ? "*" : ""} | Krystallizer`;
    const levelName = this.DOMElements.level.name;
    levelName.textContent = this.fileName;
    levelName.dataset.unsaved = isModified;
  }

  //#region Layers

  setActiveLayer(/** @type {string} */ name) {
    this.activeLayer = name === "entities" ? name : this.getLayerByName(name);
    const activeClass = "layer-active";
    this.DOMElements.entitiesLayer.div.classList.toggle(activeClass, name === "entities");

    const layerDisplay = name === "entities" ? "none" : "block";
    const entityDisplay = name === "entities" ? "block" : "none";
    this.DOMElements.layerSettings.div.style.display = layerDisplay;
    this.DOMElements.entities.style.display = entityDisplay;

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
