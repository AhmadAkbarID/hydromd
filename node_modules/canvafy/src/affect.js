"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas');

module.exports = async (template_image) => {
  let image;
  try {
    image = await loadImage(template_image);
  } catch {
    throw new Error("The image given in the argument of the affect method is not valid or you are not connected to the internet.");
  }
  const background = await loadImage(`${__dirname}/../assets/images/affect.png`);
  const canvas = await createCanvas(background.width, background.height);
  const ctx = canvas.getContext("2d");

  ctx.drawImage(background, 0, 0);
  ctx.drawImage(image, 180, 383, 200, 157);

  return canvas.toBuffer('image/png');
};