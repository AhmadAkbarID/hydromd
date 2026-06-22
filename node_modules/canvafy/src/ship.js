"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { createCanvas, loadImage, registerFont } = require('canvas');


/**
 * @typedef {object} Ship
 * @see {Ship}
 * @example const shipCard = await new canvafy.Ship()
 * @type {Class}
 */

module.exports = class Ship {
  constructor(options) {
    this.font = { name: options?.font?.name ?? "Poppins", path: options?.font?.path };
    this.avatar = "https://cdn.discordapp.com/embed/avatars/0.png";
    this.avatar2 = "https://cdn.discordapp.com/embed/avatars/0.png";
    this.number = Math.floor(Math.random() * 101);
    this.background = {
      type: "color",
      background: "#23272a"
    };
    this.overlay_opacity = 0;
    this.border;
  }


   /**
     * .setAvatars
     * @param {string|Buffer|Image} image First Avatar 
     * @param {string|Buffer|Image} image2 Second Avatar
     * @returns {Ship}
     * @example setAvatars("https://someone-image.png","https://someone-image.png")
     */
  setAvatars(image,image2) {
    this.avatar = image;
    this.avatar2 = image2;
    return this;
  }

    /**
     * .setBackground
     * @param {string} type "image" or "color"
     * @param {string|Buffer|Image} value "url" or "hexcolor"
     * @returns {Ship}
     * @example setBackground("image","https://someone-image.png")
     * @example setBackground("color","#000")
     */
  setBackground(type, value) {
    if (type === 'color') {
      if (value) {
        if (/^#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/.test(value)) {
          this.background.type = "color";
          this.background.background = value;
          return this;
        } else {
          throw new Error("Invalid color for the second argument in setForeground method. You must give a hexadecimal color.");
        }
      } else {
        throw new Error("You must give a hexadecimal color as a second argument of setBackground method.");
      }
    } else if (type === 'image') {
      if (value) {
        this.background.type = "image";
        this.background.background = value;
        return this;
      } else {
        throw new Error("You must give a background URL as a second argument.");
      }
    } else {
      throw new Error("The first argument of setBackground must be 'color' or 'image'.");
    }
  }

  /**
   * .setBorder
   * @param {string} color "hexcolor"
   * @returns {Ship}
   * @example setBorder("#fff")
   */
  setBorder(color) {
    if (color) {
      if (/^#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/.test(color)) {
        this.border = color;
        return this;
      } else {
        throw new Error("Invalid color for the argument in the setBorder method. You must give a hexadecimal color.")
      }
    } else {
      throw new Error("You must give a hexadecimal color as the argument of setBorder method.");
    }
  }


    /**
     * .setOverlayOpacity
     * @param {number} opacity must be between 0 and 1
     * @returns {Ship}
     * @example setOverlayOpacity(0.7)
     */
  setOverlayOpacity(opacity = 0) {
    if (opacity) {
      if (opacity >= 0 && opacity <= 1) {
        this.overlay_opacity = opacity;
        return this;
      } else {
        throw new Error("The value of the opacity of setOverlayOpacity method must be between 0 and 1 (0 and 1 included).");
      }
    }
  }

    /**
     * .setCustomNumber
     * @param {number} num must be between 0 and 100
     * @returns {Ship}
     * @example setCustomNumber(65)
     */ 
  setCustomNumber(num) {
    if(num < 0 || num > 100){
      throw new Error("The value of the setCustomNumber method must be between 0 and 100 (0 and 100 included).");
    }
    this.number = num;
    return this;
  }



  async build() {
    if (this.font.path) registerFont(this.font.path, {family:this.font.name});


    let sayı = this.number;

    const canvas = createCanvas(700, 350);
    const ctx = canvas.getContext("2d");
    if(this.border){
    ctx.beginPath();
    ctx.lineWidth = 8;
    ctx.strokeStyle = this.border;
    ctx.moveTo(55, 15);
    ctx.lineTo(canvas.width - 55, 15);
    ctx.quadraticCurveTo(canvas.width - 20, 20, canvas.width - 15, 55);
    ctx.lineTo(canvas.width - 15, canvas.height - 55);
    ctx.quadraticCurveTo(canvas.width - 20, canvas.height - 20, canvas.width - 55, canvas.height - 15);
    ctx.lineTo(55, canvas.height - 15);
    ctx.quadraticCurveTo(20, canvas.height - 20, 15, canvas.height - 55);
    ctx.lineTo(15, 55);
    ctx.quadraticCurveTo(20, 20, 55, 15);
    ctx.lineTo(56, 15);
    ctx.stroke();
    ctx.closePath();
    }
    
    ctx.beginPath();
    ctx.moveTo(65, 25);
    ctx.lineTo(canvas.width - 65, 25);
    ctx.quadraticCurveTo(canvas.width - 25, 25, canvas.width - 25, 65);
    ctx.lineTo(canvas.width - 25, canvas.height - 65);
    ctx.quadraticCurveTo(canvas.width - 25, canvas.height - 25, canvas.width - 65, canvas.height - 25);
    ctx.lineTo(65, canvas.height - 25);
    ctx.quadraticCurveTo(25, canvas.height - 25, 25, canvas.height - 65);
    ctx.lineTo(25, 65);
    ctx.quadraticCurveTo(25, 25, 65, 25);
    ctx.lineTo(66, 25);
    ctx.closePath();
    ctx.clip();

    ctx.globalAlpha = 1;

    if (this.background.type === "color") {
      ctx.beginPath();
      ctx.fillStyle = this.background.background;
      ctx.fillRect(10, 10, canvas.width - 20, canvas.height - 20)
    } else if (this.background.type === "image") {
      try {
        ctx.drawImage(await loadImage(this.background.background), 10, 10, canvas.width - 20, canvas.height - 20);
      } catch {
        throw new Error("The image given in the second parameter of the setBackground method is not valid or you are not connected to the internet.");
      }
    }

    ctx.beginPath();
    ctx.globalAlpha = this.overlay_opacity;
    ctx.fillStyle = "#000";
    ctx.moveTo(75, 45);
    ctx.lineTo(canvas.width - 75, 45);
    ctx.quadraticCurveTo(canvas.width - 45, 45, canvas.width - 45, 75);
    ctx.lineTo(canvas.width - 45, canvas.height - 75);
    ctx.quadraticCurveTo(canvas.width - 45, canvas.height - 45, canvas.width - 75, canvas.height - 45);
    ctx.lineTo(75, canvas.height - 45);
    ctx.quadraticCurveTo(45, canvas.height - 45, 45, canvas.height - 75);
    ctx.lineTo(45, 75);
    ctx.quadraticCurveTo(45, 45, 75, 45);
    ctx.fill();
    ctx.closePath();


var x = (700/2) - (150/2);
var y = (350/2) - (150/2);

ctx.globalAlpha = 1;

ctx.beginPath();
ctx.moveTo(x + 75, y + 30);
ctx.bezierCurveTo(x + 30, y, x, y + 30, x, y + 75);
ctx.bezierCurveTo(x, y + 120, x + 75, y + 150, x + 75, y + 150);
ctx.bezierCurveTo(x + 75, y + 150, x + 150, y + 120, x + 150, y + 75);
ctx.bezierCurveTo(x + 150, y + 30, x + 120, y, x + 75, y + 30);
ctx.closePath();

ctx.strokeStyle = "black";
ctx.lineWidth = 2;
ctx.stroke();

let doluluk;
if(sayı >= 100) doluluk = 101
if(sayı >= 90 && sayı < 100) doluluk = 130
if(sayı >= 80 && sayı < 90) doluluk = 160 
if(sayı >= 70 && sayı < 80) doluluk = 190
if(sayı >= 60 && sayı < 70) doluluk = 220
if(sayı >= 50 && sayı < 60) doluluk = 250
if(sayı >= 40 && sayı < 50) doluluk = 280
if(sayı >= 30 && sayı < 40) doluluk = 310
if(sayı >= 20 && sayı < 30) doluluk = 340
if(sayı >= 10 && sayı < 20) doluluk = 370
if(sayı >= 5 && sayı < 10) doluluk = 385
if(sayı >= 0 && sayı < 5) doluluk = 399


ctx.globalAlpha = 0.6;
var gradient = ctx.createLinearGradient(0, y, 0, doluluk);
gradient.addColorStop(0, "#ffffff");
gradient.addColorStop(0.5, "#ffffff");
gradient.addColorStop(0.5, "#ff0000");
gradient.addColorStop(0.1, "#ff0000");
ctx.fillStyle = gradient;
ctx.shadowBlur = 9;
ctx.shadowColor = "#ff0000";
ctx.shadowOffsetY = 0;
ctx.shadowOffsetX = 0;
ctx.fill();



 ctx.fillStyle = `WHITE`;
 ctx.font = `bold 36px Sans`;
 ctx.shadowBlur = 9;
        ctx.shadowColor = "#0a0a0a";
        ctx.shadowOffsetY = 8;
        ctx.shadowOffsetX = -6;
      ctx.globalAlpha = 1;
       ctx.textAlign = "center";
       ctx.fillText(`%${sayı}`, 350, 190)
    ctx.beginPath();
      ctx.lineWidth = 8;
    ctx.fill()
      ctx.lineWidth = 8;

  try {
    const messageAuthor = await loadImage(this.avatar)
    const targetMention = await loadImage(this.avatar2)
    
    ctx.globalAlpha = 1;
    ctx.beginPath();
  ctx.fill()
    ctx.lineWidth = 8;
  ctx.arc(160, 175, 90, 0, 2 * Math.PI);
  ctx.arc(540, 175, 90, 0, 2 * Math.PI);
    ctx.clip();
    ctx.drawImage(messageAuthor, 60, 75, 200, 200) 
    ctx.drawImage(targetMention, 440, 75, 200, 200)

    } catch {
      throw new Error("The image given in the argument of the setAvatars method is not valid or you are not connected to the internet.");
    }

    return canvas.toBuffer('image/png');
  }
};
