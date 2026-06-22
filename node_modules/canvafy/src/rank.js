"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas');

/**
 * @typedef {object} Rank
 * @see {Rank}
 * @example const rankCard = await new canvafy.Rank()
 * @type {Class}
 */
module.exports = class Rank {
  constructor(options) {
    this.font = { name: options?.font?.name ?? "Manrope", path: options?.font?.path };
    this.avatar = "https://cdn.discordapp.com/embed/avatars/0.png";
    this.overlay_opacity = 0.5;
    this.background = {
      type: "color",
      background: "#23272a"
    };
    this.bar = {
      color: "#ff000"
    };
    this.discriminator = {
      data: "0000",
      color: "#23272a",
      display: false,
      size: 35
    };
    this.username = {
      data: "fivesobes",
      color: "#fff",
      size: 28
    };
    this.level = {
      data: 1,
      display: false,
      text: "Level",
      text_color: "#fff",
      number_color: "#fff",
      size: 20,
      data_size: 40
    };
    this.rank = {
      data: 1,
      display: false,
      text: "Rank",
      text_color: "#fff",
      number_color: "#fff",
      size: 20,
      data_size: 40
    };
    this.current_xp = {
      data: 0,
      color: "#000"
    };
    this.required_xp = {
      data: 0,
      color: "#000"
    };
    this.status = null;
    this.border = null;
  }


  /**
     * .setAvatar
     * @param {string} image Set User Avatar URL
     * @returns {Rank}
     * @example setAvatar("https://someone-image.png")
     */
  setAvatar(image) {
    this.avatar = image;

    if (!image) throw new Error("The argument of setAvatar method is not an image or an URL.");

    return this;
  }


    /**
     * .setBackground
     * @param {string} type "image" or "color"
     * @param {string|Buffer|Image} value "url" or "hexcolor"
     * @returns {Rank}
     * @example setBackground("image","https://someone-image.png")
     * @example setBackground("color","#000")
     */
  setBackground(type, value) {
    const types = ["color", "image"];
    if (!type || typeof type !== "string") throw new Error("The first argument of setBackground method is not a string.");
    if (!types.includes(type)) throw new Error("The first argument of setBackground is not 'color' or 'image' type.");
    if (type === "color" && !value) throw new Error("The second argument of setBackground method is not a hexadecimal color.");
    if (type === "image" && !value) throw new Error("The second argument of setBackground method is not an image or an URL.");
    if (type === "color" && !/^#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/.test(value)) throw new Error("The second argument of setBackground method is not a hexadecimal color.");

    this.background.type = type;
    this.background.background = value;

    return this;
  }


   /**
   * .setBarColor
   * @param {string} color "hexcolor"
   * @returns {Rank}
   * @example setBarColor("#ff0000")
   */
  setBarColor(color) {
    if (!color || typeof color !== "string") throw new Error("The argument of setBarColor method is not a string.");
    if (!/^#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/.test(color)) throw new Error("The argument of setBarColor method is not a hexadecimal color.");

    this.bar.color = color;

    return this;
  }

    /**
     * .setBorder
     * @param {string} color "hexcolor"
     * @returns {Rank}
     * @example setBorder("#f0f0f0")
     */
  setBorder(color) {
    if (!color || typeof color !== "string") throw new Error("The argument of setBorder method is not a string.");
    if (!/^#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/.test(color)) throw new Error("The argument of setBorder method is not a hexadecimal color.");

    this.border = color;

    return this;
  }

  
    /**
     * .setOverlayOpacity
     * @param {number} opacity must be between 0 and 1
     * @returns {Rank}
     * @example setOverlayOpacity(0.5)
     */
    setOverlayOpacity(opacity = 0.5) {
    if (typeof opacity !== "number") throw new Error("The argument of setOverlayOpacity method is not a number.");
    if (opacity < 0 || opacity > 1) throw new Error("The value of the opacity of setOverlayOpacity method is not between 0 and 1 (0 and 1 included).");

    this.overlay_opacity = opacity;

    return this;
  }


  /**
     * .setLevel
     * @param {number} data Level Number
     * @param {string} text Level Text (Option)
     * @returns {Rank} 
     * @example setLevel(2)
     * @example setLevel(2,"Level")
     */
  setLevel(data, text) {
    if (typeof data !== "number") throw new Error("The first argument of setLevel method is not a number.");
    this.level.data = data;

    if (text) {
      if (typeof text !== "string") throw new Error("The second argument of setLevel method is not a string.");
      this.level.text = text;
    }
    
    if (typeof data === "number" || typeof text === "string") this.level.display = true;

    return this;
  }

  /**
     * .setLevelColor
     * @param {string} text Level Text Color "hexcolor"
     * @param {string} number Level Number Color "hexcolor"
     * @returns {Rank} 
     * @example setLevelColor({text:"#fff",number:"#fff"})
     */
  setLevelColor({ text = "#fff", number = "#fff" }) {
    if (typeof text !== "string") throw new Error("The first argument of setLevelColor method is not a string.");
    if (typeof number !== "string") throw new Error("The second argument of setLevelColor method is not a string.");
    if (!/^#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/.test(text)) throw new Error("The first argument of setLevelColor method is not a hexadecimal color.");
    if (!/^#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/.test(number)) throw new Error("The second argument of setLevelColor method is not a hexadecimal color.");

    this.level.text_color = text;
    this.level.number_color = number;

    return this;
  }

  /**
     * .setRank
     * @param {number} data Rank Number
     * @param {string} text Rank Text (Option)
     * @returns {Rank} 
     * @example setRank(2)
     * @example setRank(2,"Rank")
     */
  setRank(data, text) {
    if (typeof data !== "number") throw new Error("The first argument of setRank method is not a number.");
    this.rank.data = data;

    if (text) {
      if (typeof text !== "string") throw new Error("The second argument of setRank method is not a string.");
      this.rank.text = text;
    }
    
    if (typeof data === "number" || typeof text === "string") this.rank.display = true;

    return this;
  }

   /**
     * .setRankColor
     * @param {string} text Rank Text Color "hexcolor"
     * @param {string} number Rank Number Color "hexcolor"
     * @returns {Rank} 
     * @example setRankColor({text:"#fff",number:"#fff"})
     */
  setRankColor({ text = "#fff", number = "#fff" }) {
    if (typeof text !== "string") throw new Error("The first argument of setRankColor method is not a string.");
    if (typeof number !== "string") throw new Error("The second argument of setRankColor method is not a string.");
    if (!/^#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/.test(text)) throw new Error("The first argument of setRankColor method is not a hexadecimal color.");
    if (!/^#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/.test(number)) throw new Error("The second argument of setRankColor method is not a hexadecimal color.");

    this.rank.text_color = text;
    this.rank.number_color = number;

    return this;
  }

  /**
     * .setCurrentXp
     * @param {number} xp User Current Xp Number
     * @param {string} color Current Xp Text Color "hexcolor"
     * @returns {Rank} 
     * @example setCurrentXp(100)
     * @example setCurrentXp(100,"#000")
     */
  setCurrentXp(xp, color = "#000") {
    if (typeof xp !== "number") throw new Error("The first argument of setCurrentXp method is not a number.");
    if (!color || typeof color !== "string") throw new Error("The second argument of setCurrentXp method is not a string.");
    if (!/^#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/.test(color)) throw new Error("The second argument of setCurrentXp method is not a hexadecimal color.");

    this.current_xp.data = xp;
    this.current_xp.color = color;

    return this;
  }

  /**
     * .setRequiredXp
     * @param {number} xp User Required Xp Number
     * @param {string} color Required Xp Text Color "hexcolor"
     * @returns {Rank} 
     * @example setRequiredXp(300)
     * @example setRequiredXp(300,"#000")
     */
  setRequiredXp(xp, color = "#000") {
    if (typeof xp !== "number") throw new Error("The first argument of setRequiredXp method is not a number.");
    if (!color || typeof color !== "string") throw new Error("The second argument of setRequiredXp method is not a string.");
    if (!/^#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/.test(color)) throw new Error("The second argument of setRequiredXp method is not a hexadecimal color.");

    this.required_xp.data = xp;
    this.required_xp.color = color;

    return this;
  }

    /**
     * .setUsername
     * @param {string} username User Username
     * @param {string} color Username Text Color "hexcolor"
     * @returns {Rank} 
     * @example setUsername("fivesobes")
     * @example setUsername("fivesobes","#fff")
     */
  setUsername(username, color = "#fff") {
    if (!username || typeof username !== "string") throw new Error("The first argument of setUsername method is not a string.");
    if (!color || typeof color !== "string") throw new Error("The second argument of setUsername method is not a string.");
    if (!/^#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/.test(color)) throw new Error("The second argument of setUsername method is not a hexadecimal color.");

    this.username.data = username;
    this.username.color = color;

    return this;
  }

  /**
     * .setStatus
     * @param {string} status User Status "dnd","idle","online","offline","stream"
     * @returns {Rank} 
     * @example setStatus("dnd")
     */
  setStatus(status) {
    if (!status || typeof status !== "string") throw new Error("The argument of setStatus method is not a string.");

    const statutes = {
      online: "#3ba55c",
      idle: "#faa61a",
      dnd: "#ed4245",
      stream: "#593695",
      offline: "#747f8e"
    };

    if (!statutes[status]) throw new Error("The argument of setStatus method is not a valid status.");

    this.status = statutes[status];

    return this;
  }

   /**
     * .setCustomStatus
     * @param {string} color User Status Custom Color "hexcolor"
     * @returns {Rank} 
     * @example setCustomStatus("#ff0000")
     */
  setCustomStatus(color) {
    if (!color || typeof color !== "string") throw new Error("The argument of setCustomStatus method is not a string.");
    if (!/^#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/.test(color)) throw new Error("The argument of setCustomStatus method is not a hexadecimal color.");

    this.status = color;

    return this;
  }

  async build() {
    if (this.font.path) GlobalFonts.registerFromPath(this.font.path, this.font.name);

    const max_xp_bar_width = 500;
    const xp_bar = Math.floor(this.current_xp.data / this.required_xp.data * max_xp_bar_width);


    const canvas = createCanvas(850, 300);
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

    ctx.globalAlpha = 1;

    ctx.font = `${this.username.size}px ${this.font.name} Bold`;
    ctx.fillStyle = this.username.color;
    ctx.textAlign = "start";
    const username = this.username.data.length > 15 ? this.username.data.slice(0, 15) + '...' : this.username.data;
    ctx.fillText(`${username}`, 258, 125);


    let level_text_width = 0;
    let level_width = 0;

    if (this.level.display == true) {
      ctx.textAlign = "end";
      ctx.fillStyle = this.level.text_color;
      ctx.font = `${this.level.data_size}px ${this.font.name} Bold`;
      ctx.fillText(this.level.data.toString().toUpperCase(), 250 + max_xp_bar_width, 90);

      level_width = ctx.measureText(this.level.data.toString()).width + 5;

      ctx.fillStyle = this.level.number_color;
      ctx.font = `${this.level.size}px ${this.font.name} Bold`;
      ctx.fillText(this.level.text.toUpperCase(), 250 + max_xp_bar_width - level_width, 90);

      level_text_width = ctx.measureText(this.level.text).width + 30;
    }

    if (this.rank.display == true) {
      ctx.textAlign = "end";
      ctx.fillStyle = this.rank.text_color;
      ctx.font = `${this.rank.data_size}px ${this.font.name} Bold`;
      ctx.fillText(this.rank.data.toString().toUpperCase(), 200 + max_xp_bar_width - level_text_width - level_width, 90);

      const rank_width = ctx.measureText(this.rank.data.toString().toUpperCase()).width + 5;

      ctx.fillStyle = this.rank.number_color;
      ctx.font = `${this.rank.size}px ${this.font.name} Bold`;
      ctx.fillText(this.rank.text.toUpperCase(), 200 + max_xp_bar_width - level_text_width - level_width - rank_width, 90);
    }

    ctx.beginPath();
    ctx.globalAlpha = 1;
    ctx.lineWidth = 2;
    ctx.fillStyle = "#efeded";
    ctx.moveTo(220, 135);
    ctx.lineTo(200 + max_xp_bar_width, 135);
    ctx.quadraticCurveTo(220 + max_xp_bar_width, 135, 220 + max_xp_bar_width, 152.5);
    ctx.quadraticCurveTo(220 + max_xp_bar_width, 170, 200 + max_xp_bar_width, 170);
    ctx.lineTo(220, 170);
    ctx.lineTo(220, 135);
    ctx.fill();
    ctx.closePath();

    ctx.beginPath();
    ctx.globalAlpha = 1;
    ctx.lineWidth = 2;
    ctx.fillStyle = this.bar.color;
    ctx.moveTo(220, 135);
    ctx.lineTo(200 + xp_bar, 135);
    ctx.quadraticCurveTo(220 + xp_bar, 135, 220 + xp_bar, 152.5);
    ctx.quadraticCurveTo(220 + xp_bar, 170, 200 + xp_bar, 170);
    ctx.lineTo(220, 170);
    ctx.lineTo(220, 135);
    ctx.fill();
    ctx.textAlign = "start";
    ctx.font = `23px ${this.font.name} Bold`;
    ctx.fillStyle = this.current_xp.color;
    ctx.fillText(`${this.current_xp.data}`, 590, 162)

    ctx.fillStyle = this.required_xp.color;
    ctx.fillText(` / ${this.required_xp.data}`, 590 + ctx.measureText(this.current_xp.data.toString()).width, 162)
    ctx.closePath();





    if (this.status) {
      ctx.beginPath();
      ctx.globalAlpha = 1;
      ctx.arc(150, 150, 95, 0, Math.PI * 2);
      ctx.fillStyle = this.status;
      ctx.fill();
      ctx.closePath();
    }

    ctx.beginPath();
    ctx.arc(150, 150, this.status ? 90 : 95, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    try {
      if (this.status) {
        ctx.drawImage(await loadImage(this.avatar), 60, 60, 180, 180);
      } else {
        ctx.drawImage(await loadImage(this.avatar), 55, 55, 190, 190);
      }
    } catch {
      throw new Error("The image given in the argument of the setAvatar method is not valid or you are not connected to the internet.");
    }

    return canvas.toBuffer('image/png');
  }
};