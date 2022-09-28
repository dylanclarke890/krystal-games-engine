const defaultSettings = {
  id: "gameCanvas",
  name: "Canvas Game",
  overwritePageTitle: true,
  createCanvas: true,
  context: "2d",
  width: 500,
  borderWidth: 1,
  height: 500,
  background: "black",
  applyBackground: true,
  color: "white",
  applyColor: true,
  positionCanvas: true,
  positionX: "middle",
  positionY: "middle",
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
      positionCanvas,
      positionX,
      positionY,
      borderWidth,
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
    if (positionCanvas) {
      const { clientWidth, clientHeight } = document.documentElement;
      canvas.style.position = "absolute";
      switch (positionX) {
        case "middle":
          canvas.style.left = (clientWidth - canvas.width) / 2 + "px";
          break;
        case "right":
          canvas.style.left = clientWidth - canvas.width + "px";
          break;
        case "left":
        default:
          canvas.style.left = 0;
          break;
      }

      switch (positionY) {
        case "middle":
          canvas.style.top =
            (clientHeight - canvas.height) / 2 + window.pageYOffset + "px";
          break;
        case "bottom":
          canvas.style.top = clientHeight - canvas.height - borderWidth + "px";
          break;
        case "top":
        default:
          canvas.style.top = 0;
          break;
      }
    }

    const ctx = canvas.getContext(context);
    this.ctx = ctx;

    if (overwritePageTitle) document.title = name;

    if (createCanvas) document.body.appendChild(canvas);
  }
}
