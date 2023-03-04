export const config = {
  collisionTiles: {
    path: "./krystallizer/assets/collision_tiles.png",
    tilesize: 64,
  },
  /** Colors to use for the background, selection boxes, text and the grid. */
  colors: {
    clear: "#000000", // Background Color
    highlight: "#ceff36", // Currently selected tile or entity
    primary: "#ffffff", // Labels and layer bounds
    secondary: "#555555", // Grid and tile selection bounds
    selection: "#ff9933", // Selection cursor box on tile maps
  },
  directories: {
    /** Directory to recursively load assets from. */
    images: "test-data/assets",
    /** Directory to use for loading and saving files. */
    levels: "test-data/scenes",
    /** Directories to import entities from. */
    entities: ["test-data/entities/entities.js"],
  },
  entity: {
    /** Include a list of properties to show by default. */
    show: ["pos", "size", "bounciness"],
    /** Fallback image, mainly for invisible entities. */
    previewNotAvailableImagePath: "./krystallizer/assets/image-slash.svg",
  },
  general: {
    confirmDeleteLayer: true,
    confirmDeleteEntity: true,
    confirmDiscardChanges: true,
    loadLastLevel: true,
    newFileName: "untitled.js",
    /** Controls whether to 'prettify' the saved level. */
    prettyPrint: true,
    undoDepth: 50,
  },
  /** Font face and size for entity labels and the grid coordinates. */
  labels: {
    draw: true,
    font: "10px Bitstream Vera Sans Mono, Monaco, sans-serif",
    step: 32,
  },
  layerDefaults: {
    width: 10,
    height: 10,
    tilesize: 32,
  },
  logging: {
    enabled: true,
    /** @type {"debug"|"info"|"warning"|"error"|"critical"} */
    level: "debug",
    showTimestamp: true,
  },
  storageKeys: {
    lastLevel: "krystallizer_lastLevel",
  },
  view: {
    zoom: 1,
  },
};
