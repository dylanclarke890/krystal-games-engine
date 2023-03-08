import { EventSystem } from "../modules/core/event-system.js";
import { BackgroundMap } from "../modules/core/map.js";
import { Guard } from "../modules/lib/sanity/guard.js";
import { $el, screenshotCanvas } from "../modules/lib/utils/dom.js";
import { bind } from "../modules/lib/utils/func.js";
import { Logger } from "../modules/lib/utils/logger.js";
import { config } from "./config.js";
import { EditorActions, InputEvents } from "./enums.js";

export class Modal {
  /**
   * @param {Object} settings
   * @param {string} settings.id
   * @param {["sm"|"md"|"lg"|"fullscreen"]} settings.size
   * @param {[string]} settings.title
   * @param {[string]} settings.body
   * @param {[string]} settings.footer
   * @param {[string[]]} settings.triggeredBy
   * @param {[(modal: Modal) => void]} settings.onBeforeConstruct
   * @param {[(modal: HTMLDivElement) => void]} settings.onAfterConstruct
   * @param {[(modal: HTMLDivElement) => void]} settings.onOpen
   * @param {[(modal: HTMLDivElement) => void]} settings.onClose
   * @param {[(modal: HTMLDivElement) => void]} settings.onDestroy
   */
  constructor(settings = {}) {
    this.bindListeners(settings);
    this.construct(settings);
    this.bindEvents(settings);
  }

  bindListeners({ onBeforeConstruct, onAfterConstruct, onOpen, onClose, onDestroy }) {
    this.events = {
      beforeConstruct: bind(onBeforeConstruct),
      afterConstruct: bind(onAfterConstruct),
      open: bind(onOpen),
      close: bind(onClose),
      destroy: bind(onDestroy),
    };
  }

  construct({ id, title, body, footer, size }) {
    this.events.beforeConstruct(this);
    title = title
      ? `
      <div class="modal-header">
        <span class="modal-close">&times;</span>
        <h2>${title}</h2>
      </div>`
      : "";
    body = body
      ? `
      <div class="modal-body">
        ${body}
      </div>`
      : "";
    footer = footer
      ? `
      <div class="modal-footer">
        ${footer}
      </div>`
      : "";

    const modal = document.createElement("div");
    modal.id = id;
    modal.className = "modal";
    modal.innerHTML = `
      <div class="modal-content ${size ?? "md"}">
        ${title}
        ${body}
        ${footer}
      </div>`;
    document.body.querySelector("script").before(modal);
    this.modal = modal;
    this.events.afterConstruct(modal);
  }

  bindEvents({ triggeredBy }) {
    for (let i = 0; i < triggeredBy.length; i++) {
      if (triggeredBy[i] instanceof HTMLElement) {
        triggeredBy[i].addEventListener("click", () => this.open());
        continue;
      }
      const triggers = document.querySelectorAll(triggeredBy[i]);
      if (!triggers || !triggers.length) continue;
      triggers.forEach((trigger) => trigger.addEventListener("click", () => this.open()));
    }

    const closeBtns = this.modal.querySelectorAll(".modal-close");
    for (let i = 0; i < closeBtns.length; i++) {
      const btn = closeBtns[i];
      btn.addEventListener("click", () => this.close());
    }
  }

  open() {
    if (this.destroyed) document.body.querySelector("script").before(this.modal);
    this.modal.style.display = "block";
    this.outsideClickEvent = (e) => e.target === this.modal && this.close();
    this.keyupEvent = (e) => e.key === "Escape" && this.close();
    window.addEventListener("click", this.outsideClickEvent);
    document.addEventListener("keyup", this.keyupEvent);
    this.events.open(this.modal);
  }

  close() {
    this.modal.style.display = "none";
    window.removeEventListener("click", this.outsideClickEvent);
    document.removeEventListener("keyup", this.keyupEvent);
    this.events.close(this.modal);
  }

  destroy() {
    document.body.removeChild(this.modal);
    window.removeEventListener("click", this.outsideClickEvent);
    document.removeEventListener("keyup", this.keyupEvent);
    this.events.destroy(this.modal);
    this.destroyed = true;
  }
}

export class ConfirmModal extends Modal {
  /**
   * @extends Modal
   * @param {Object} settings
   * @param {string} settings.id
   * @param {["sm"|"md"|"lg"|"fullscreen"]} settings.size
   * @param {[string]} settings.title
   * @param {[string]} settings.body
   * @param {[string[]]} settings.triggeredBy
   * @param {[string]} settings.okText
   * @param {[(e: ClickEvent) => void]} settings.onOk
   * @param {[() => void]} settings.onCancel
   * @param {[string]} settings.cancelText
   * @param {[(modal: ConfirmModal) => void]} settings.onBeforeConstruct
   * @param {[(modal: HTMLDivElement) => void]} settings.onAfterConstruct
   * @param {[(modal: HTMLDivElement) => void]} settings.onOpen
   * @param {[(modal: HTMLDivElement) => void]} settings.onClose
   * @param {[(modal: HTMLDivElement) => void]} settings.onDestroy
   */
  constructor(settings = {}) {
    super(settings);
  }

  bindListeners({ onOk, onCancel, ...rest }) {
    super.bindListeners(rest);
    this.events.ok = bind(onOk);
    this.events.cancel = bind(onCancel);
  }

  construct({ id, size, title, body, okText = "Confirm", cancelText = "Cancel" }) {
    const footer = `
      <div class="panel__actions">
        <button class="btn btn-sm modal-confirm">${okText}</button>
        <button class="btn btn-sm modal-cancel">${cancelText}</button>
      </div>
    `;
    super.construct({ id, size, title, body, footer });
  }

  bindEvents({ triggeredBy }) {
    super.bindEvents({ triggeredBy });

    const closeBtns = this.modal.querySelectorAll(".modal-close");
    for (let i = 0; i < closeBtns.length; i++) {
      const btn = closeBtns[i];
      btn.addEventListener("click", (e) => this.events.cancel(e));
    }

    const cancelBtn = this.modal.querySelector(".modal-cancel");
    const confirmBtn = this.modal.querySelector(".modal-confirm");

    cancelBtn.addEventListener("click", (e) => {
      this.events.cancel(e);
      this.close();
    });
    confirmBtn.addEventListener("click", (e) => {
      this.events.ok(e);
      this.close();
    });
  }
}

export class SelectLevelModal extends Modal {
  /**
   * @param {Object} settings
   * @param {string} settings.id
   * @param {[string[]]} settings.triggeredBy
   * @param {[(lvl: LevelData) => void]} settings.onSelect
   * @param {[(modal: SelectLevelModal) => void]} settings.onBeforeConstruct
   * @param {[(modal: HTMLDivElement) => void]} settings.onAfterConstruct
   * @param {[(modal: HTMLDivElement) => void]} settings.onOpen
   * @param {[(modal: HTMLDivElement) => void]} settings.onClose
   * @param {[(modal: HTMLDivElement) => void]} settings.onDestroy
   * @param {[(lvls: LevelData[]) => void]} settings.onLevelsLoaded
   */
  constructor(settings = {}, httpClient) {
    super(settings);
    /** @type {import("./http-client.js").KrystallizerHttpClient} */
    this.httpClient = httpClient;
    this.httpClient.api
      .browse(config.directories.levels, "scripts")
      .then((paths) => this.loadLevels(paths));
    this.logger = Logger.getInstance();
    this.selected = null;
  }

  bindListeners({ onSelect, onLevelsLoaded, ...rest }) {
    super.bindListeners(rest);
    this.events.select = bind(onSelect);
    this.events.levelsLoaded = bind(onLevelsLoaded);
  }

  construct({ id }) {
    const body = "Loading...";
    const footer = `
      <div class="panel__actions">
        <button class="btn btn-sm modal-confirm">Select</button>
        <button class="btn btn-sm modal-cancel">Cancel</button>
      </div>
    `;
    super.construct({ id, title: "Load Level", body, footer, size: "lg" });
  }

  /**
   * @param {string[]} paths
   */
  loadLevels(paths) {
    Promise.allSettled(
      paths.map((path) =>
        this.httpClient.api.file(path, { parseResponse: false }).then((data) => ({
          path,
          data: this.parseData(data),
        }))
      )
    ).then((results) => {
      const levels = results
        .filter((result) => result.status === "fulfilled")
        .map((result) => result.value);
      this.updateLevels(levels);
      this.events.levelsLoaded(levels);
    });
  }

  parseData(data) {
    if (!data) {
      Logger.getInstance().error("parseData - no data provided.");
      return;
    }

    // extract JS object from level data.
    const jsonMatch = data.match(/\/\*JSON-BEGIN\*\/\s?([\s\S]*?);?\s?\/\*JSON-END\*/);
    if (jsonMatch) {
      let json = jsonMatch[1];
      // Some keys may be stored in modern JS format i.e without quotes. Find and replace them.
      const matches = json.match(/(\w+):/g);
      if (matches) {
        matches.forEach((v) => {
          // v === 'match:' - we want it to be '"match":'
          const match = v.substring(0, v.length - 1);
          json = json.replace(v, `"${match}":`);
        });
      }

      // Remove all trailing commas on arrays and objects.
      json = json.replace(/,(?=\s*[}|\]])/gm, "");

      // Finally, we can parse it:
      data = JSON.parse(json);
    }

    return data;
  }

  updateLevels(levels) {
    this.levels = levels;
    const body = this.modal.querySelector(".modal-body");
    if (!levels?.length) {
      body.innerHTML = "<p class='text-center'>Sorry, no levels found.</span>";
      return;
    }

    const options = [];
    for (let i = 0; i < levels.length; i++) {
      const { path, data } = levels[i];
      const levelName = path.substring(path.lastIndexOf("/") + 1);
      const levelOption = document.createElement("div");
      levelOption.className = "level-option";
      levelOption.dataset.path = path;
      levelOption.innerHTML = `
        <img class="level-option__preview loading" src="../krystallizer/assets/loading.svg" >
        <span class="level-option__name">${levelName}</span>`;
      options.push(levelOption);
      this.getLevelPreviewImage(levelOption, data);
    }
    body.innerHTML = "";
    body.append(...options);
    this.bindLevelOptionEvents(options);
  }

  /**
   * @param {HTMLDivElement} levelOption
   * @param {*} data
   */
  getLevelPreviewImage(levelOption, data) {
    const { x, y, ts } = data.layer.reduce(
      (prev, curr) => ({
        x: Math.max(prev.x, curr.width),
        y: Math.max(prev.y, curr.height),
        ts: Math.max(prev.ts, curr.tilesize),
      }),
      { x: 0, y: 0, ts: 0 }
    );
    const w = x * ts;
    const h = y * ts;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = w;
    canvas.height = h;

    let currentLayer = 0;
    const bgLayers = data.layer.filter((l) => l.visible && !l.repeat);
    for (let i = 0; i < bgLayers.length; i++) {
      const layer = bgLayers[i];
      if (layer.name === "collision") layer.tileset = config.collisionTiles.path;
      const bgMap = new BackgroundMap({
        ...layer,
        system: {
          width: w,
          height: h,
          ctx,
          ready: true,
          scale: 1,
          getImagePixels(image, x, y, width, height) {
            const canvas = document.createElement("canvas");
            canvas.width = image.width;
            canvas.height = image.height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(image, 0, 0, width, height);
            return ctx.getImageData(x, y, width, height);
          },
          drawPosition(x) {
            return x;
          },
        },
        autoset: true,
      });
      bgMap.tiles.load(() => {
        bgMap.draw();
        if (++currentLayer >= bgLayers.length) {
          const img = levelOption.querySelector("img");
          img.src = canvas.toDataURL();
          img.classList.remove("loading");
        }
      });
    }
  }

  /**
   * @param {HTMLDivElement[]} options
   */
  bindLevelOptionEvents(options) {
    for (let i = 0; i < options.length; i++) {
      const opt = options[i];
      opt.addEventListener("click", (e) => {
        this.selected = this.levels.find((l) => l.path === opt.dataset.path);
        for (let j = 0; j < options.length; j++)
          options[j].classList.toggle("selected", options[j] === opt);
        if (e.detail === 2) this.close(); //double click
      });
    }
  }

  bindEvents(settings) {
    super.bindEvents(settings);
    const closeBtns = this.modal.querySelectorAll(".modal-close");
    for (let i = 0; i < closeBtns.length; i++) {
      const btn = closeBtns[i];
      btn.addEventListener("click", () => {
        this.selected = null;
        this.close();
      });
    }

    const cancelBtn = this.modal.querySelector(".modal-cancel");
    const confirmBtn = this.modal.querySelector(".modal-confirm");
    cancelBtn.addEventListener("click", () => {
      this.selected = null;
      this.close();
    });
    confirmBtn.addEventListener("click", () => this.close());
  }

  close() {
    this.events.select(this.selected);
    this.selected = null;
    const options = this.modal.querySelectorAll(".level-option");
    for (let i = 0; i < options.length; i++) options[i].classList.remove("selected");
    super.close();
  }
}

export class EntityDisplay {
  constructor(entity, { className, filepath }) {
    Guard.againstNull({ entity });
    Guard.againstNull({ className }).isTypeOf("string");
    Guard.againstNull({ filepath }).isTypeOf("string");
    /** @type {import("../modules/core/entity.js").Entity} */
    this.entity = entity;
    this.className = className;
    this.filepath = filepath;
    this.mouse = { x: 0, y: 0 };
    this.construct();
  }

  /** Get the preview image. For invisible entities, a fallback image will be used. */
  getPreviewImage() {
    const preview = document.createElement("img");
    preview.draggable = false;
    preview.classList.add("entity-display__preview", "loading");
    preview.src = "./krystallizer/assets/loading.svg";

    const notAvailableImgSrc = config.entity.previewNotAvailableImagePath;
    const img = new Image();
    let src;
    if (this.entity.animSheet?.image?.path)
      src = `${this.entity.animSheet.image.path}?${new Date().getTime()}`;
    else src = notAvailableImgSrc;
    const onLoad = () => {
      img.removeEventListener("load", onLoad);
      if (src === notAvailableImgSrc) {
        preview.classList.remove("loading");
        preview.dataset.no_img = "true";
        preview.src = src;
        return;
      }

      const canvas = document.createElement("canvas");
      canvas.width = this.entity.size.x;
      canvas.height = this.entity.size.y;

      const ctx = canvas.getContext("2d");
      const origCtx = this.entity.game.system.ctx;

      this.entity.game.system.ctx = ctx;
      this.entity.draw();
      this.entity.game.system.ctx = origCtx;

      preview.width = this.entity.size.x;
      preview.height = this.entity.size.y;
      preview.classList.remove("loading");
      preview.src = screenshotCanvas(canvas).src;
    };
    img.addEventListener("load", onLoad);
    img.addEventListener("error", (e) =>
      Logger.getInstance().critical("EntityDisplay - construct - error loading image:", e)
    );
    img.src = src;

    return preview;
  }

  /** Build the display. */
  construct() {
    const parent = document.getElementById("entities__list");
    const div = document.createElement("div");
    div.classList.add("entity-display");

    const name = document.createElement("span");
    name.classList.add("entity-display__name");
    name.textContent = this.className;

    const preview = this.getPreviewImage();
    div.append(preview);
    div.append(name);

    this.mouseDown = (e) => this.mousedown(e);
    div.addEventListener("pointerdown", this.mouseDown);
    EventSystem.on(InputEvents.MouseMove, this.updateMousePosition);
    parent.append(div);
    this.DOMElements = { div, name, preview };
    this.toolbarOffset = $el("#toolbar").offsetWidth;
  }

  updateMousePosition = (mouse) => {
    this.mouse = { x: mouse.x + this.toolbarOffset, y: mouse.y };
  };

  /**
   *  Used for the drag and drop actions.
   *  @param {MouseEvent} e
   */
  mousedown(e) {
    if (e.button !== 0) return; // don't action other types of clicks
    const { preview } = this.DOMElements;
    const clone = preview.cloneNode(true);
    document.body.appendChild(clone);

    const cloneW = clone.offsetWidth;
    const cloneH = clone.offsetHeight;

    clone.style.position = "absolute";
    clone.style.left = `${this.mouse.x - cloneW / 2}px`;
    clone.style.top = `${this.mouse.y + cloneH / 2}px`;
    clone.style.cursor = "none";

    const canvas = document.querySelector("canvas");
    if (!canvas) {
      Logger.getInstance().critical("EntityDisplay: canvas not found.");
      return;
    }
    const origCursor = canvas.style.cursor;
    canvas.style.cursor = "none";
    EventSystem.dispatch(EditorActions.EntityDragStart, this.entity);

    let target;
    const mouseMove = (e) => {
      clone.style.left = `${this.mouse.x - cloneW / 2}px`;
      clone.style.top = `${this.mouse.y + cloneH / 2}px`;
      clone.style.pointerEvents = "none";
      target = document.elementFromPoint(e.clientX, e.clientY); // Select the element beneath the dragged clone.
      clone.style.removeProperty("pointer-events");
    };

    const mouseUp = () => {
      document.removeEventListener("pointermove", mouseMove);
      clone.removeEventListener("pointerup", mouseUp);
      document.body.removeChild(clone);
      canvas.style.cursor = origCursor;
      if (target !== canvas) return;
      const pos = {
        x: parseInt(clone.style.left),
        y: parseInt(clone.style.top),
      };
      EventSystem.dispatch(EditorActions.EntityDragEnd, { className: this.className, pos });
    };

    document.addEventListener("pointermove", mouseMove);
    clone.addEventListener("pointerup", mouseUp);
  }

  /** Remove from DOM and remove any event listeners. */
  destroy() {
    const { div } = this.DOMElements;
    div.removeEventListener("pointerdown", this.mouseDown);
    div.parentElement.removeChild(div);
    EventSystem.off(InputEvents.MouseMove, this.updateMousePosition);
  }
}

export class Panel {
  /**
   * @param {Object} settings
   * @param {string} settings.selector
   */
  constructor({ selector }) {
    const div = $el(selector);
    this.DOMElements = {
      div,
      header: div.querySelector(".panel__header"),
      content: div.querySelector(".panel__content"),
      toggle: div.querySelector(".panel__toggle-icon"),
    };
    this.isOpen = this.DOMElements.header.classList.contains("open");
    this.isShowing = div.style.display === "block";
    this.bindEvents();
    this.hide();
  }

  bindEvents() {
    const { header } = this.DOMElements;
    header.addEventListener("click", () => this.toggleCollapse());
  }

  toggleCollapse(force) {
    if (force != null) {
      if (force) this.open();
      else this.close();
      return;
    }

    if (this.isOpen) this.close();
    else this.open();
  }

  toggleVisible(force) {
    if (force != null) {
      if (force) this.show();
      else this.hide();
      return;
    }

    if (this.isShowing) this.hide();
    else this.show();
  }

  close() {
    const { content, toggle } = this.DOMElements;
    content.classList.remove("open");
    toggle.dataset.direction = "right";
    this.isOpen = false;
  }

  open() {
    const { content, toggle } = this.DOMElements;
    content.classList.add("open");
    toggle.dataset.direction = "down";
    this.isOpen = true;
  }

  show(autoOpen = true) {
    const { div } = this.DOMElements;
    div.style.display = "block";
    div.offsetHeight;
    this.isShowing = true;
    if (autoOpen) this.open();
  }

  hide(autoClose = true) {
    const { div } = this.DOMElements;
    if (autoClose) this.close();
    div.offsetHeight;
    div.style.display = "none";
    this.isShowing = false;
  }
}
