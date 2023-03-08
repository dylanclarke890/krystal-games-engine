import { EventSystem } from "../../modules/core/event-system.js";
import { Guard } from "../../modules/lib/sanity/guard.js";
import { Rect } from "../../modules/lib/utils/shapes.js";
import { EditorEvents } from "../enums.js";
import { Command, CompositeCommand } from "./base-commands.js";

export class SelectionBox {
  static #nothingSelectedElement;
  static #selectedContainer;
  static {
    const nothingSelected = document.createElement("h3");
    nothingSelected.classList.add("text-center");
    nothingSelected.textContent = "Nothing currently selected.";
    this.#nothingSelectedElement = nothingSelected;

    const selectedContainer = document.createElement("div");
    selectedContainer.id = "selected-list";
    this.#selectedContainer = selectedContainer;
  }

  /** @type {import("../../modules/core/entity.js").Entity[]} */
  #entities;

  constructor(ctx, panel, entities) {
    Guard.againstNull({ ctx });
    Guard.againstNull({ panel });
    Guard.againstNull({ entities });

    /** @type {{actual: {x:number, y:number}, rounded: {x:number, y:number}}} */
    this.screen = screen;
    /** @type {CanvasRenderingContext2D} */
    this.ctx = ctx;
    /** @type {import("../ui.js").Panel} */
    this.panel = panel;

    this.pos = { x: 0, y: 0 };
    this.size = { x: 0, y: 0 };
    this.absoluteRect = new Rect({ x: 0, y: 0 }, { x: 0, y: 0 });

    this.#entities = entities;
    /** @type {import("../../modules/core/entity.js").Entity[]} */
    this.selected = [];
    this.active = false;
    this.isSelecting = false;
    this.currentMultiCmd = new CompositeCommand();
    this.#bindEvents();
  }

  #bindEvents() {
    EventSystem.on(EditorEvents.EntityDeleted, (e) => {
      const deletedEntityIndex = this.selected.findIndex((s) => s === e);
      if (deletedEntityIndex !== -1) this.selected.splice(deletedEntityIndex, 1);
      this.updatePanel();
    });
  }

  enterMode() {
    this.updatePanel();
    this.panel.show();
  }

  leaveMode() {
    this.panel.hide();
  }

  updatePanel() {
    const { content } = this.panel.DOMElements;

    if (!this.selected.length) {
      content.replaceChildren(SelectionBox.#nothingSelectedElement);
      return;
    }

    const selections = [];
    for (let i = 0; i < this.selected.length; i++) {
      const selected = this.selected[i];
      const el = document.createElement("div");
      el.textContent = `Entity: Pos - x: ${selected.pos.x}, y: ${selected.pos.y}`;
      el.classList.add("selected-list__item");
      selections.push(el);
    }

    const container = SelectionBox.#selectedContainer;
    container.innerHTML = "";
    container.replaceChildren(...selections);
    content.replaceChildren(container);
  }

  setActive(value) {
    this.active = !!value;
  }

  startSelection(x, y) {
    this.currentMultiCmd.addCmd(new SelectionClearCmd(this)); // describes the next line.
    this.clear(true);
    this.move(x, y);
    this.size.x = 1;
    this.size.y = 1;
    this.isSelecting = true;
  }

  /**
   * Move the selection box. Number passed should be the difference in size, not the new size.
   * @param {number} x
   * @param {number} y
   */
  updateSelectionRange(x, y) {
    this.size.x += x;
    this.size.y += y;
  }

  endSelection() {
    this.isSelecting = false;
    EventSystem.dispatch(EditorEvents.NewUndoState, this.currentMultiCmd);
    this.currentMultiCmd = new CompositeCommand();
    this.selectCmd = null;
  }

  getSelection() {
    if (!this.active) return;

    const a = this.absoluteRect;
    a.pos.x = this.pos.x;
    a.pos.y = this.pos.y;
    a.size.x = this.size.x;
    a.size.y = this.size.y;

    if (a.size.x < 0) {
      const size = Math.abs(a.size.x);
      const pos = a.pos.x;
      a.pos.x = pos - size;
      a.size.x = size;
    }

    if (a.size.y < 0) {
      const size = Math.abs(a.size.y);
      const pos = a.pos.y;
      a.pos.y = pos - size;
      a.size.y = size;
    }

    this.selected = this.#entities.filter((e) => a.overlapsRect(e));
    this.updatePanel();
  }

  /**
   * Check whether a point (like the current location of the mouse) is within the current selection rect.
   * @param {number} x
   * @param {number} y
   * @returns False if not currently active, else true if the point is within the selection box.
   */
  isPointWithinSelection(x, y) {
    if (!this.active) return false;
    return this.absoluteRect.containsPoint({ x, y });
  }

  /**
   * Move the selection box. Number passed should be the distance to move, not the new position.
   * @param {number} x
   * @param {number} y
   */
  move(x, y) {
    this.pos.x += x;
    this.pos.y += y;
    for (let i = 0; i < this.selected.length; i++) {
      this.selected[i].pos.x += x;
      this.selected[i].pos.y += y;
    }
  }

  /**
   * Draw the selection box and highlight currently selected objects.
   * @param {{actual:{x: number, y:number}, rounded: {x:number, y:number}}} screen required in order
   * to be able to draw itself relative to other objects.
   */
  draw(screen) {
    if (!this.active) return;
    const { actual } = screen;
    const ctx = this.ctx;

    const x = this.pos.x - actual.x;
    const y = this.pos.y - actual.y;
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = "lightblue";
    ctx.fillRect(x, y, this.size.x, this.size.y);
    ctx.strokeStyle = "darkblue";
    ctx.strokeRect(x, y, this.size.x, this.size.y);
    ctx.globalAlpha = 1;

    ctx.strokeStyle = "#2196f3";
    ctx.lineWidth = 2;
    ctx.lineDashOffset = 2;
    for (let i = 0; i < this.selected.length; i++) {
      const entity = this.selected[i];
      const x = entity.pos.x - actual.x;
      const y = entity.pos.y - actual.y;
      ctx.strokeRect(x, y, entity.size.x, entity.size.y);
    }
  }

  /**
   * Reset the selection box, ready for the next selection.
   * @param {[boolean]} active If passed, will set the active state of the selection box. Defaults to false.
   */
  clear(active) {
    this.pos.x = 0;
    this.pos.y = 0;
    this.size.x = 0;
    this.size.y = 0;

    this.absoluteRect.pos.x = 0;
    this.absoluteRect.pos.y = 0;
    this.absoluteRect.size.x = 0;
    this.absoluteRect.size.y = 0;

    this.selected = [];
    this.active = !!active;
    this.isSelecting = false;
    this.updatePanel();
  }

  /**
   * @param {import("../../modules/core/entity.js").Entity[]} entities
   */
  set newEntitiesReference(entities) {
    this.#entities = entities;
  }
}

// #region Undo/Redo Commands

class SelectionClearCmd extends Command {
  constructor(box) {
    super();
    this.box = box;
    this.prevSelected = box.selected.slice(); // make a copy of the previously selected entities
    this.prevActive = box.active;
  }

  execute() {
    this.box.clear(false); // clear the selection box without changing the active state
  }

  undo() {
    this.box.selected = this.prevSelected; // restore the previous selection
    this.box.updatePanel();
    this.box.active = this.prevActive; // restore the previous active state
  }
}

// #endregion Undo/Redo Commands
