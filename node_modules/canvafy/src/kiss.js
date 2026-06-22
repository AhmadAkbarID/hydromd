"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas');
const fs = require("fs");

module.exports = async (image1,image2) => {
    if (!image1) throw new Error(`You must provide an image as a first argument.`);
    if (!image2) throw new Error(`You must provide an image as a second argument.`);
        const canvas = createCanvas(768, 574);
        const ctx = canvas.getContext("2d");
        const background = await loadImage("https://runkit-packages-raw.com/18.x.x/1680269029438/kojiro-image-generation/src/assets/kiss.png");
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
        const avatar = await loadImage(image1);
        const avatar1 = await loadImage(image2);
        ctx.drawImage(avatar1, 370, 25, 200, 200);
        ctx.drawImage(avatar, 150, 25, 200, 200);

        return canvas.toBuffer('image/png');
};