const defaultSettings = {
  id: "gameCanvas",
  name: "Canvas Game",
  overwritePageTitle: true,
  createCanvas: true,
  context: "2d",
  width: 500,
  height: 500,
  background: "black",
  applyBackground: true,
  color: "white",
  applyColor: true,
};

class Game {
  constructor({ ...settings } = {}) {
    this.settings = { ...defaultSettings, ...settings }; // TODO: update assignment to deeply assign values.
  }

  create() {
    const {
      id,
      createCanvas,
      context,
      name,
      overwritePageTitle,
      width,
      height,
      background,
      applyBackground,
      color,
      applyColor,
    } = this.settings;

    let canvas;
    if (createCanvas) {
      canvas = document.createElement("canvas");
      canvas.id = id;
    } else {
      canvas = document.getElementsById(id);
    }

    canvas.width = width;
    canvas.style.width = width;
    canvas.height = height;
    canvas.style.height = height;

    if (applyBackground) document.body.style.background = background;
    if (applyColor) canvas.style.background = color;

    const ctx = canvas.getContext(context);
    this.ctx = ctx;

    if (overwritePageTitle) document.title = name;

    if (createCanvas) document.body.appendChild(canvas);
  }
}
