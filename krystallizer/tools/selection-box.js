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
    this.currentMultiCmd.addCmd(new SelectionClearCmd(this));
    this.selectCmd = new SelectionSizeCmd(this, x, y);
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
    this.getSelection();
  }

  endSelection() {
    this.isSelecting = false;

    this.selectCmd.setSizeTo(this.size.x, this.size.y);
    this.currentMultiCmd.addCmd(this.selectCmd);
    EventSystem.dispatch(EditorEvents.NewUndoState, this.currentMultiCmd);

    this.currentMultiCmd = new CompositeCommand();
    this.selectCmd = null;
  }

  getSelection() {
    if (!this.active) return;
    this.#updateAbsoluteRect();
    this.selected = this.#entities.filter((e) => this.absoluteRect.overlapsRect(e));
    this.updatePanel();
  }

  #updateAbsoluteRect() {
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
  }

  /**
   * Check whether a point (like the current location of the mouse) is within the current selection rect.
   * @param {number} x
   * @param {number} y
   * @returns False if not currently active, else true if the point is within the selection box.
   */
  isPointWithinSelection(x, y) {
    if (!this.active) return false;
    this.#updateAbsoluteRect();
    return this.absoluteRect.containsPoint({ x, y });
  }

  startMoving() {
    this.moveCmd = new SelectionMoveCmd(this);
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

  endMoving() {
    this.moveCmd.finishedMoving(this.pos.x, this.pos.y);
    this.getSelection();
    EventSystem.dispatch(EditorEvents.NewUndoState, this.moveCmd);
    this.moveCmd = null;
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

class SelectionCmd extends Command {
  constructor(box) {
    super();
    /** @type {SelectionBox} */
    this.box = box;
    this.pos = { ...this.box.pos };
    this.size = { ...this.box.size };
  }

  setBackToOriginalSize() {
    this.box.size.x = this.size.x;
    this.box.size.y = this.size.y;
  }

  setBackToOriginalPosition() {
    this.box.pos.x = this.pos.x;
    this.box.pos.y = this.pos.y;
  }
}

class SelectionMoveCmd extends SelectionCmd {
  constructor(box) {
    super(box);
    this.diff = { x: 0, y: 0 };
  }

  undo() {
    this.box.move(-this.diff.x, -this.diff.y);
  }

  execute() {
    this.box.move(this.diff.x, this.diff.y);
  }

  finishedMoving(x, y) {
    this.diff.x = x - this.pos.x;
    this.diff.y = y - this.pos.y;
  }
}

class SelectionClearCmd extends SelectionCmd {
  constructor(box) {
    super(box);
    this.prevActive = box.active;
  }

  undo() {
    this.setBackToOriginalPosition();
    this.setBackToOriginalSize();
    this.box.active = this.prevActive;
    this.box.getSelection();
  }

  execute() {
    this.box.clear(true);
  }
}

class SelectionSizeCmd extends SelectionCmd {
  constructor(box, sx, sy) {
    super(box);
    this.startPos = { x: sx, y: sy };
  }

  undo() {
    this.setBackToOriginalPosition();
    this.setBackToOriginalSize();
    this.box.getSelection();
  }

  execute() {
    this.pos = { ...this.startPos };
    this.setBackToOriginalPosition();
    this.box.updateSelectionRange(this.sizeTo.x, this.sizeTo.y);
  }

  setSizeTo(x, y) {
    this.sizeTo = { x, y };
  }
}

// #endregion Undo/Redo Commands
