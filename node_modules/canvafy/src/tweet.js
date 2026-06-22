"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas');
const path = require('path');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

/**
 * @typedef {object} Tweet
 * @see {Tweet}
 * @example const tweetCard = await new canvafy.Tweet()
 * @type {Class}
 */
module.exports = class Tweet {
  constructor(options) {
    this.font = { name: options?.font?.name ?? "Chirp", path: options?.font?.path };
    this.avatar = "https://cdn.discordapp.com/avatars/928259219038302258/299ebac2bc13f5a8f44d2dd1f0c9f856.png?size=1024";
    this.comment = "This is a tweet card. You can customize it as you wish. Enjoy! #Canvafy";
    this.verified = false;
    this.client = null;
    this.theme = "light";
    this.user = { displayName: "Beş", username: "fivesobes" };
  }


  /**
   * .setAvatar
   * @param {string} image Set User Avatar URL
   * @returns {Tweet}
   * @example setAvatar("https://someone-image.png")
   */
  setAvatar(image) {
    this.avatar = image;
    return this;
  };

  /**
   * .setUser
   * @param {object} user {displayName: "string", username: "string"}
   * @returns {Tweet}
   * @example setUser({displayName: "Beş", username: "fivesobes"})
   */
  setUser({ displayName, username }) {
    this.user = { displayName, username };
    return this;
  };

  /**
   * .setComment
   * @param {string} text Set User Comment
   * @returns {Tweet}
   * @example setComment("This is a tweet card. You can customize it as you wish. Enjoy! #Canvafy")
   */
  setComment(text) {
    this.comment = text;
    return this;
  };

  /**
   * .setTheme
   * @param {string} theme Set Theme
   * @returns {Tweet}
   * @example setTheme("dark")
   * @example setTheme("light")
   * @example setTheme("dim")
   * @throws {Error} Invalid theme
   */
  setTheme(theme) {
    if (!["dark", "light", "dim"].some(e => e == theme)) throw new Error("Invalid theme");
    this.theme = theme;
    return this;
  };

  /**
   * .setVerified
   * @param {boolean} verified Set Verified
   * @returns {Tweet}
   * @example setVerified(true)
   * @example setVerified(false)
   * @throws {Error} Verified must be a boolean
   */
  setVerified(verified) {
    if (typeof verified !== "boolean") throw new Error("Verified must be a boolean");
    this.verified = verified;
    return this;
  };


  async build() {
    if (this.font.path) GlobalFonts.registerFromPath(this.font.path, this.font.name);

    var canvas = createCanvas(968, 343);
    var ctx = canvas.getContext("2d");
    var totalHeight = calculateHeight(ctx,this.comment);
    canvas = createCanvas(968, 343 + totalHeight);
    ctx = canvas.getContext("2d");

    ctx.beginPath();
    ctx.fillStyle = this.theme === "dim" ? "#15202b" : this.theme == "light" ? "#fff" : "#000";
    ctx.fillRect(10, 10, canvas.width - 20, canvas.height - 20)

    ctx.fillStyle = this.theme === "dim" ? "#fff" : this.theme == "light" ? "#000" : "#fff";
    ctx.textAlign = "left";
    ctx.font = "25px Chirp";
    ctx.fillText(this.user.displayName, 130, 70);

    ctx.fillStyle = this.theme === "dim" ? "#8493a2" : this.theme == "light" ? "#000" : "#8493a2";
    ctx.textAlign = "left";
    ctx.font = "25px Chirp";
    ctx.fillText("@" + this.user.username, 130, 100);

    if (this.verified === true) {
      var textLength = ctx.measureText(this.user.displayName).width;
      ctx.drawImage(await loadImage(`${__dirname}/../assets/images/twitter-verified.png`), (textLength + 140), 48, 30, 30);
    }

    writeComment(ctx,this.comment,this.theme);


    try {
      ctx.drawImage(await loadImage(`${__dirname}/../assets/images/reply.png`), 186.6, canvas.height - 68, 45, 45);
      ctx.drawImage(await loadImage(`${__dirname}/../assets/images/retweet.png`), 384, canvas.height - 68, 45, 45);
      ctx.drawImage(await loadImage(`${__dirname}/../assets/images/like.png`), 577.8, canvas.height - 68, 45, 45);
      ctx.drawImage(await loadImage(`${__dirname}/../assets/images/share.png`), 771, canvas.height - 68, 45, 45);
      ctx.drawImage(await loadImage(`${__dirname}/../assets/images/other.png`), 900, 40, 35, 35);
    } catch (err) {
      console.log(err);
    };

    ctx.strokeStyle = "#8493a2";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(50, canvas.height - 88);
    ctx.lineTo(918, canvas.height - 88);
    ctx.stroke();


    ctx.beginPath();
    ctx.arc(80, 75, 40, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();


    try {
      ctx.drawImage(await loadImage(this.avatar), 93 - 58, 28, 90, 90);
    } catch {
      throw new Error("The image given in the argument of the setAvatar method is not valid or you are not connected to the internet.");
    }


    return canvas.toBuffer('image/png');
  }
};





function writeComment(ctx,comment,theme){
  comment = comment.length > 2490 ? comment.slice(0, 2490) + "..." : comment;
  if(!comment.includes(" ")) {
    comment.length > 57 ? comment = comment.slice(0, 57) + "..." : comment;
    ctx.fillStyle = theme == "light" ? "#000" : "#fff";
    ctx.font = "25px Chirp";
    ctx.fillText(comment, 85, 170);
    return;
  }
  var words = comment.split(' ');
  var line = '';
  var lineHeight = 40;
  var x = 85;
  var y = 170;

  for (var i = 0; i < words.length; i++) {
    var testLine = line + words[i] + ' ';
    var metrics = ctx.measureText(testLine).width;
    if (metrics > 800) {
      ctx.fillStyle = theme == "light" ? "#000" : "#fff";
      ctx.font = "25px Chirp";
      ctx.fillText(line, x, y);

      line = words[i] + ' ';
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillStyle = theme == "light" ? "#000" : "#fff";
  ctx.fillText(line, x, y);
};


function calculateHeight(ctx,comment){
  comment = comment.length > 2490 ? comment.slice(0, 2490) + "..." : comment;
  if(!comment.includes(" ")) {
    comment.length > 57 ? comment = comment.slice(0, 57) + "..." : comment;
    return 40;
  }
  var words = comment.split(' ');
  var line = '';
  var lineHeight = 40;
  var totalHeight = 0;

  for (var i = 0; i < words.length; i++) {
    var testLine = line + words[i] + ' ';
    var metrics = ctx.measureText(testLine).width;
    if (metrics > 800) {
      line = words[i] + ' ';
      totalHeight += lineHeight * 2.2;
    } else {
      line = testLine;
    }
  }
  totalHeight += lineHeight;
  return totalHeight;
}