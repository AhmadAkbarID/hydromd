"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas');

module.exports = async (template_image) => {
  let image;
  try {
    image = await loadImage(template_image);
  } catch {
    throw new Error("The image given in the argument of the invert method is not valid or you are not connected to the internet.");
  }
  const canvas = await createCanvas(image.width, image.height);
  const ctx = canvas.getContext("2d");

  ctx.drawImage(image, 0, 0);

  const image_data = ctx.getImageData(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < image_data.data.length; i += 4) {
    image_data.data[i] = 255 - image_data.data[i];
    image_data.data[i + 1] = 255 - image_data.data[i + 1];
    image_data.data[i + 2] = 255 - image_data.data[i + 2];
  }

  ctx.putImageData(image_data, 0, 0);

  return canvas.toBuffer('image/png');
};