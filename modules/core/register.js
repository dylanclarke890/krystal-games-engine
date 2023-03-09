import { uniqueId } from "../lib/utils/string.js";

/**
 * To be used when the asset passed to MediaFactory.create-* is just a path to the resource, instead of one of the various
 * media classes that are used for them (GameImage etc). Will call the relevant load logic for each media type.
 */
export class AssetToPreload {
  path = "";
  type = "";
  data = null;

  constructor({ path, type }) {
    this.path = path;
    this.type = type;
  }

  load(loadCallback) {
    switch (this.type) {
      case "font": {
        const fontFace = new FontFace(uniqueId("font-"), `url(${this.path})`);
        document.fonts.add(fontFace);
        this.data = fontFace;
        this.data.load().then(
          () => loadCallback(this.path, true), // Success
          () => loadCallback(this.path, false) // Failure
        );
        break;
      }
      case "image": {
        this.data = new Image();
        this.data.onload = () => {
          loadCallback(this.path, true);
        };
        this.data.onerror = () => {
          loadCallback(this.path, false);
        };
        this.data.src = this.path;
        break;
      }
      case "sound": {
        this.data = new Audio(this.path);
        this.data.oncanplaythrough = () => {
          this.data.oncanplaythrough = null;
          loadCallback(this.path, true);
        };
        this.data.onerror = () => loadCallback(this.path, false);
        break;
      }
      default:
        throw new Error(`Unable to determine type of asset to preload: ${this.type}`);
    }
  }
}

export class Register {
  static #assetCache = {};
  static #preloadCache = {
    classDefinitions: {},
    assets: {
      image: new Set(),
      sound: new Set(),
      font: new Set(),
    },
  };

  static get assetsToPreload() {
    const preload = this.#preloadCache.assets;
    const allAssets = new Set([...preload.font, ...preload.image, ...preload.sound]);
    return [...allAssets.values()];
  }

  static get classDefinitions() {
    return this.#preloadCache.classDefinitions;
  }

  static get assetCache() {
    return this.#assetCache;
  }

  static entityTypes(...classDefinitions) {
    const store = this.#preloadCache.classDefinitions;
    classDefinitions.forEach((cd) => {
      store[cd.name] = cd;
    });
  }

  static getEntityByType(className) {
    if (typeof className !== "string") return className;
    return this.#preloadCache.classDefinitions[className];
  }

  static preloadImages(...imgOrPaths) {
    imgOrPaths.forEach((i) => this.preloadAsset(i, "image"));
  }

  static preloadSounds(...soundsOrPaths) {
    soundsOrPaths.forEach((i) => this.preloadAsset(i, "sound"));
  }

  static preloadFonts(...fontFacesOrPaths) {
    fontFacesOrPaths.forEach((i) => this.preloadAsset(i, "font"));
  }

  static preloadAsset(asset, type = "image") {
    if (typeof asset === "string") asset = new AssetToPreload({ path: asset, type });
    const store = this.#preloadCache.assets[type];
    store.add(asset);
  }

  static clearPreloadCache() {
    this.#preloadCache.assets = {
      image: new Set(),
      sound: new Set(),
      font: new Set(),
    };
  }

  static setCacheAsset(path, asset) {
    this.#assetCache[path] = asset;
  }

  static getCacheAsset(path) {
    return this.#assetCache[path];
  }

  /**
   * Get all the assets currently cached, optionally omitting some asset types.
   * @example getCacheEntries(GameImage, GameAudio)
   * @param {type[]} omitEntriesOfType
   */
  static getAssetCacheEntries(...omitEntriesOfType) {
    return Object.values(this.#assetCache).filter(
      (asset) => !omitEntriesOfType.some((type) => asset instanceof type)
    );
  }
}
