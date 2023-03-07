import { EventSystem } from "../../modules/core/event-system.js";
import { Guard } from "../../modules/lib/sanity/guard.js";
import { Rect } from "../../modules/lib/utils/shapes.js";
import { EditorEvents } from "../enums.js";
import { SelectionBoxMoveCommand } from "./undo-commands.js";

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

  constructor(ctx, panel) {
    Guard.againstNull({ ctx });
    this.screen = screen;
    /** @type {CanvasRenderingContext2D} */
    this.ctx = ctx;
    /** @type {import("../ui.js").Panel} */
    this.panel = panel;

    this.rect = new Rect({ x: 0, y: 0 }, { x: 0, y: 0 });
    this.absoluteRect = new Rect({ x: 0, y: 0 }, { x: 0, y: 0 });

    this.selected = [];
    this.active = false;
    this.isSelecting = false;
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
    this.clear(true);
    this.move(x, y);
    this.rect.size.x = 1;
    this.rect.size.y = 1;
    this.isSelecting = true;
  }

  /**
   * Move the selection box. Number passed should be the difference in size, not the new size.
   * @param {number} x
   * @param {number} y
   */
  resize(x, y) {
    this.rect.size.x += x;
    this.rect.size.y += y;
  }

  endSelection() {
    this.isSelecting = false;
  }

  getSelection(entities) {
    if (!this.active) return;

    const r = this.rect;
    this.absoluteRect.pos.x = r.pos.x;
    this.absoluteRect.pos.y = r.pos.y;
    this.absoluteRect.size.x = r.size.x;
    this.absoluteRect.size.y = r.size.y;

    if (r.size.x < 0) {
      const size = Math.abs(r.size.x);
      const pos = r.pos.x;
      this.absoluteRect.pos.x = pos - size;
      this.absoluteRect.size.x = size;
    }

    if (r.size.y < 0) {
      const size = Math.abs(r.size.y);
      const pos = r.pos.y;
      this.absoluteRect.pos.y = pos - size;
      this.absoluteRect.size.y = size;
    }

    this.selected = entities.filter((e) => this.absoluteRect.overlapsRect(e));
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
    this.rect.pos.x += x;
    this.rect.pos.y += y;
    for (let i = 0; i < this.selected.length; i++) {
      this.selected[i].pos.x += x;
      this.selected[i].pos.y += y;
    }
    EventSystem.dispatch(EditorEvents.NewUndoState, new SelectionBoxMoveCommand(this, x, y));
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
    const { pos, size } = this.rect;

    const x = pos.x - actual.x;
    const y = pos.y - actual.y;
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = "lightblue";
    ctx.fillRect(x, y, size.x, size.y);
    ctx.strokeStyle = "darkblue";
    ctx.strokeRect(x, y, size.x, size.y);
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
    this.rect.pos.x = 0;
    this.rect.pos.y = 0;
    this.rect.size.x = 0;
    this.rect.size.y = 0;

    this.absoluteRect.pos.x = 0;
    this.absoluteRect.pos.y = 0;
    this.absoluteRect.size.x = 0;
    this.absoluteRect.size.y = 0;

    this.selected = [];
    this.active = !!active;
    this.isSelecting = false;
    this.updatePanel();
  }
}
