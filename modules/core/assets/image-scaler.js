import { VendorAttributes } from "../../lib/utils/vendor-attributes.js";

export class ImageScaler {
  /**
   * Nearest-Neighbor scaling:
   * The original image is drawn into an offscreen canvas of the same size
   * and copied into another offscreen canvas with the new size.
   * The scaled offscreen canvas becomes the image (data) of this object.
   * @param {Image} image
   * @param {number} scale
   */
  static resizeImage(image, scale) {
    const canvas = document.createElement("canvas");
    canvas.width = image.width * scale;
    canvas.height = image.height * scale;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas;
  }

  /**
   * Extract the real, actual pixels from an image.
   * @param {Image} image
   * @param {number} x
   * @param {number} y
   * @param {number} width
   * @param {number} height
   */
  static getImagePixels(image, x, y, width, height) {
    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext("2d");

    VendorAttributes.set(ctx, "imageSmoothingEnabled", false);
    VendorAttributes.set(ctx, "imageSmoothingQuality", "high");

    const ratio = window.devicePixelRatio || 1;
    const realWidth = image.width * ratio,
      realHeight = image.height * ratio;

    canvas.width = Math.ceil(realWidth);
    canvas.height = Math.ceil(realHeight);

    ctx.drawImage(image, 0, 0, realWidth, realHeight);
    return ctx.getImageData(x, y, width, height);
  }
}
