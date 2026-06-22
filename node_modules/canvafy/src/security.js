"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

/**
 * @typedef {object} Security
 * @see {Security}
 * @example const securityCard = await new canvafy.Security()
 * @type {Class}
 */
module.exports = class Security {
  constructor(options) {
    this.font = { name: options?.font?.name ?? "Poppins", path: options?.font?.path };
    this.avatar = "https://cdn.discordapp.com/embed/avatars/0.png";
    this.userid;
    this.control;
    this.locale = "en";
    this.createdtime;
    this.suspecttime;
    this.background = {
      type: "color",
      background: "#23272a"
    };
    this.overlay_opacity = 0;
    this.border;
    this.avatar_border = "#2a2e35";
  }


    /**
     * .setAvatar
     * @param {string} image Set User Avatar URL
     * @returns {Security}
     * @example setAvatar("https://someone-image.png")
     */
  setAvatar(image) {
    this.avatar = image;
    return this;
  }

  /**
     * .setAvatarBorder
     * @param {string} color Set Avatar Avatar Border Color
     * @returns {Security}
     * @example setAvatarBorder("#fff")
     */
  setAvatarBorder(color) {
    if (color) {
      if (/^#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/.test(color)) {
        this.avatar_border = color;
        return this;
      } else {
        throw new Error("Invalid color for the argument in the setBorder method. You must give a hexadecimal color.")
      }
    } else {
      throw new Error("You must give a hexadecimal color as the argument of setBorder method.");
    }
  }


    /**
     * .setLocale
     * @param {string} lang someone language code
     * @returns {Security}
     * @example setLocale("en")
     * @example setLocale("fr")
     */
    setLocale(lang) {
      if (lang) {
          if(typeof lang !== "string")throw new Error('You must add a parameter of String type setLocale! Invalid Type');
              this.locale = lang;
              return this;
          } else {
              throw new Error("The setLocale parameter cannot be left blank, please enter a someone language code. example; 'en','fr','tr' etc.");
          }
      }


     /**
     * .setCreatedTimestamp
     * @param {number} time someone discord user createdtimestamp
     * @returns {Security}
     * @example setCreatedTimestamp(someoneUser.createdTimestamp)
     */
   setCreatedTimestamp(time) {
    if (time) {
        if(typeof time !== "number")throw new Error('You must add a parameter of Number type setCreatedTimestamp! Invalid createdtimestamp');
            this.createdtime = time;
            return this;
        } else {
            throw new Error("The setCreatedTimestamp parameter cannot be left blank, please enter a user createdtimestamp.");
        }
    }

    /**
     * .setSuspectTimestamp
     * @param {number} time period of time to be considered suspect
     * @returns {Security}
     * @example setSuspectTimestamp(604800000)
     * @example setSuspectTimestamp(someoneMsTime)
     */
   setSuspectTimestamp(time) {
    if (time) {
        if(typeof time !== "number")throw new Error('You must add a parameter of Number type setSuspectTimestamp! Invalid suspect timestamp');
            this.suspecttime = time;
            return this;
        } else {
            throw new Error("The setSuspectTimestamp parameter cannot be left blank, please enter a user suspect timestamp.");
        }
    }



  /**
     * .setBackground
     * @param {string} type "image" or "color"
     * @param {string|Buffer|Image} value "url" or "hexcolor"
     * @returns {Security}
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
     * @returns {Security}
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
     * @returns {Security}
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

  async build() {
    if (this.font.path) GlobalFonts.registerFromPath(this.font.path, this.font.name);

    const canvas = createCanvas(600, 150);
    const ctx = canvas.getContext("2d");

    var kontrol = false;
    if((Date.now() - this.createdtime) >= this.suspecttime)kontrol = true;

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


    let color;
    if(kontrol == true) color = "#00ff00";
    if(kontrol == false) color = "#fc9c25";

    ctx.beginPath();
    ctx.globalAlpha = 1;
    ctx.lineWidth = 5;
    ctx.shadowBlur = 9;
    ctx.shadowColor = color;
    ctx.shadowOffsetY = 0;
    ctx.shadowOffsetX = 0;
    ctx.strokeStyle = color;
    ctx.arc(465, 75, 30, 0, Math.PI * 2);
    ctx.stroke();
    ctx.closePath();

    if(kontrol == true){
    ctx.font = `35px Abyss`;
    ctx.globalAlpha = 1;
    ctx.fillStyle = color;
    ctx.shadowBlur = 9;
    ctx.shadowColor = color;
    ctx.shadowOffsetY = 0;
    ctx.shadowOffsetX = 0;
    ctx.fillText(`✓`, 450, 90);
    }else {
    ctx.font = `35px Abyss`;
    ctx.globalAlpha = 1;
    ctx.fillStyle = color;
    ctx.shadowBlur = 9;
    ctx.shadowColor = color;
    ctx.shadowOffsetY = 0;
    ctx.shadowOffsetX = 0;
    ctx.fillText(`!`, 457, 87);
    }



    const createdDateString = new Date(this.createdtime).toLocaleDateString(this.locale,{ month: 'long', day: 'numeric', year: 'numeric' });
    ctx.font = `15px ${this.font.name} Bold`;
    ctx.globalAlpha = 1;
    ctx.fillStyle = this.avatar_border;
    ctx.shadowBlur = 9;
    ctx.shadowColor = this.avatar_border;
    ctx.shadowOffsetY = 0;
    ctx.shadowOffsetX = 0;
    ctx.fillText(`${createdDateString}`, 90, 80);


    ctx.beginPath();
    ctx.globalAlpha = 1;
    ctx.lineWidth = 5;
    ctx.strokeStyle = this.avatar_border;
    ctx.arc(300, 75, 46, 0, Math.PI * 2);
    ctx.stroke();
   

    ctx.beginPath();
    ctx.arc(300, 75, 40, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip(); 

    try {
      ctx.drawImage(await loadImage(this.avatar), 255, 32, 90, 90);
    } catch {
      throw new Error("The image given in the argument of the setAvatar method is not valid or you are not connected to the internet.");
    }



    return canvas.toBuffer('image/png');
  }
};