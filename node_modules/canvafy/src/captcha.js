"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
module.exports = class Captcha {
  constructor(options) {
    this.font = { name: options?.font?.name ?? "Poppins", path: options?.font?.path };
    this.code;
    this.color = "#f0f0f0";
    this.background = {
      type: "color",
      background: "#23272a"
    };
    this.overlay_opacity = 0;
    this.border;
  }

  
    /**
     * .setCaptchaKey
     * @param {string} code someone captcha code
     * @returns {Captcha}
     */
    setCaptchaKey(code) {
      if (code) {
          if(typeof code !== "string")throw new Error('You must add a parameter of String type setCaptchaKey! Invalid Type');
              this.code = code;
              return this;
          } else {
              throw new Error("The setCaptchaKey parameter cannot be left blank, please enter a someone code.");
          }
      }


  /**
     * .setBackground
     * @param {string} type "image" or "color"
     * @param {string|Buffer|Image} value "url" or "hexcolor"
     * @returns {Captcha}
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
     * @returns {Captcha}
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
     * @returns {Captcha}
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

  async build() {
    if (this.font.path) GlobalFonts.registerFromPath(this.font.path, this.font.name);

    const canvas = createCanvas(600, 150);
    const ctx = canvas.getContext("2d");

    if(this.createdtime >= this.suspecttime){
    this.control = true;
    }else{
    this.control = false;
    }
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
    ctx.moveTo(65, 35);
    ctx.lineTo(canvas.width - 65, 35);
    ctx.quadraticCurveTo(canvas.width - 35, 35, canvas.width - 35, 65);
    ctx.lineTo(canvas.width - 35, canvas.height - 65);
    ctx.quadraticCurveTo(canvas.width - 35, canvas.height - 35, canvas.width - 65, canvas.height - 35);
    ctx.lineTo(65, canvas.height - 35);
    ctx.quadraticCurveTo(35, canvas.height - 35, 35, canvas.height - 65);
    ctx.lineTo(35, 65);
    ctx.quadraticCurveTo(35, 35, 65, 35);
    ctx.fill();
    ctx.closePath();


    ctx.font = `35px Poppins Bold`;
    ctx.globalAlpha = 1;
    ctx.textAlign = "center"
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 9;
    ctx.shadowColor = this.color;
    ctx.shadowOffsetY = 0;
    ctx.shadowOffsetX = 0;
    ctx.fillText(`${this.code}`, canvas.width / 2, 87);
    

    return canvas.toBuffer('image/png');
  }
};