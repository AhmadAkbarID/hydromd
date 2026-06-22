"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas');
const path = require('path');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

/**
 * @typedef {object} Instagram
 * @see {Instagram}
 * @example const InstagramCard = await new canvafy.Instagram()
 * @type {Class}
 */
module.exports = class Instagram {
  constructor(options) {
    this.font = { name: options?.font?.name ?? "Chirp", path: options?.font?.path };
    this.avatar = "https://cdn.discordapp.com/avatars/928259219038302258/299ebac2bc13f5a8f44d2dd1f0c9f856.png?size=1024";
    this.verified = true;
    this.theme = "dark";
    this.user = { username: "fivesobes" };
    this.like = { likeCount: 5, likeText: "likes" };
    this.image = "https://cdn.discordapp.com/avatars/928259219038302258/299ebac2bc13f5a8f44d2dd1f0c9f856.png?size=1024";
    this.postDate = (Date.now() - 5000);
    this.isSaved = true;
    this.isLiked = true;
    this.story = true;
  }


  /**
   * .setStory
   * @param {boolean} story Set Story
   * @returns {Instagram}
   * @example setStory(true)
   * @example setStory(false)
   * @throws {Error} Story must be a boolean
   * @returns {Instagram}
   */
  setStory(story) {
    if (typeof story !== "boolean") throw new Error("Story must be a boolean type");
    this.story = story;
    return this;
  }

  /**
   * .setAvatar
   * @param {string} image Set User Avatar URL
   * @returns {Instagram}
   * @example setAvatar("https://someone-image.png")
   */
  setAvatar(image) {
    this.avatar = image;
    return this;
  };

  /**
   * .setUser
   * @param {object} user {username: "string"}
   * @returns {Instagram}
   * @example setUser({username: "fivesobes"})
   */
  setUser({ username }) {
    var newUsername = username.replace(/[^a-zA-Z0-9_]/g, '').trim();
    this.user = { username: newUsername };
    return this;
  };

   
  /**
   * .setPostDate
   * @param {number} date Set Post Date
   * @returns {Instagram}
   * @example setPostDate(Date.now() - 15000)
   * @throws {Error} Date must be a number
   * @returns {Instagram}
   * @example setPostDate(Date.now() - 100000)
   */
  setPostDate(date){
  if(typeof date !== "number") throw new Error("Date must be a number type");
  this.postDate = date;
  return this;
  };

  /**
   * .setSaved
   * @param {boolean} saved Set Saved
   * @returns {Instagram}
   * @example setSaved(true)
   * @example setSaved(false)
   * @throws {Error} Saved must be a boolean
   * @returns {Instagram}
   */
  setSaved(saved){
    if(typeof saved !== "boolean") throw new Error("Saved must be a boolean type");
    this.isSaved = saved;
    return this;
  }


  /**
   * .setLiked
   * @param {boolean} liked Set Liked
   * @returns {Instagram}
   * @example setLiked(true)
   * @example setLiked(false)
   * @throws {Error} Liked must be a boolean
   * @returns {Instagram}
   */
  setLiked(liked){
    if(typeof liked !== "boolean") throw new Error("Liked must be a boolean type");
    this.isLiked = liked;
    return this;
  }

  /**
   * .setLikeCount
   * @param {number} count Set Like Count
   * @returns {Instagram}
   * @example setLikeCount(5)
   * @throws {Error} Count must be a number type
   */
  setLike({ count, likeText }){
  if(typeof count !== "number") throw new Error("Count must be a number type");
  if(typeof likeText !== "string") throw new Error("Like text must be a string type");
  this.like = { likeCount:count, likeText:likeText }
  return this;
  };

  /**
   * .setPostImage
   * @param {string} image Set Post Image
   * @returns {Instagram}
   * @example setPostImage("https://someone-image.png")
   */
  setPostImage(image){
    this.image = image;
    return this;
  };

  /**
   * .setTheme
   * @param {string} theme Set Theme
   * @returns {Instagram}
   * @example setTheme("dark")
   * @example setTheme("light")
   * @throws {Error} Invalid theme
   */
  setTheme(theme) {
    if (!["dark", "light"].some(e => e == theme)) throw new Error("Invalid theme");
    this.theme = theme;
    return this;
  };

  /**
   * .setVerified
   * @param {boolean} verified Set Verified
   * @returns {Instagram}
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

    var canvas = createCanvas(1080, 1450);
    var ctx = canvas.getContext("2d");

    if(this.user.username.trim().length < 1) throw new Error("Username must be at least 1 character long.");

    ctx.beginPath();
    ctx.fillStyle = this.theme == "light" ? "#fff" : "#000";
    ctx.fillRect(10, 10, canvas.width - 20, canvas.height - 20)

    ctx.fillStyle = this.theme == "light" ? "#000" : "#fff";
    ctx.textAlign = "left";
    ctx.font = "50px Chirp Bold";
    ctx.fillText(`${this.user.username.length > 14 ? this.user.username.slice(0,14)+".." : this.user.username}`, 145, 105);

    ctx.fillStyle = this.theme == "light" ? "#000" : "#fff";
    ctx.textAlign = "left";
    ctx.font = "45px Chirp Bold";
    ctx.fillText(`${formatLikes(this.like.likeCount)} ${this.like.likeText.length > 10 ? this.like.likeText.slice(0,10)+"..": this.like.likeText}`,50, canvas.height - 120);

    ctx.fillStyle = "#afafaf";
    ctx.textAlign = "left";
    ctx.font = "30px Chirp Bold";
    ctx.fillText(`${timeAgo(this.postDate)}`,50, canvas.height - 65);


    if (this.verified === true) {

      var textLengthBlank = {
        8: 220,
        9: 225,
        10: 230,
        11: 235,
        12: 240,
        13: 245,
        14: 250,
        15: 255,
        16: 260,
      };

      ctx.font = "35px Chirp Bold";
      var textLength = ctx.measureText(this.user.username.length > 14 ? this.user.username.slice(0,14)+".." : this.user.username).width;
      ctx.drawImage(await loadImage(`${__dirname}/../assets/images/twitter-verified.png`), (this.user.username.length < 8 ? (textLength + 200) : textLengthBlank[this.user.username.length > 14 ? 16 : this.user.username.length] + textLength), 60, 60, 60);
    }

    ctx.fillStyle = "#fff";
    ctx.fillRect(10, 170, canvas.width - 20, canvas.height - 480);

    ctx.drawImage(await loadImage(this.image), 10, 170, canvas.width - 20, canvas.height - 470);


    try {
      if(this.story) {
        ctx.drawImage(await loadImage(`${__dirname}/../assets/images/instagram-story-frame.png`), 7.5, 14, 140, 140);
      }
      if(this.isLiked) {
        ctx.drawImage(await loadImage(`${__dirname}/../assets/images/instagram-liked.png`), 40, canvas.height - 270, 80, 80);
      } else {
        ctx.drawImage(await loadImage(`${__dirname}/../assets/images/instagram-like-${this.theme == "light" ? "dark" : "light"}.png`), 40, canvas.height - 270, 80, 80);
      }
      ctx.drawImage(await loadImage(`${__dirname}/../assets/images/instagram-comment-${this.theme == "light" ? "dark" : "light"}.png`), 160, canvas.height - 270, 75, 75);
      ctx.drawImage(await loadImage(`${__dirname}/../assets/images/instagram-share-${this.theme == "light" ? "dark" : "light"}.png`), 280, canvas.height - 270, 80, 80);
      ctx.drawImage(await loadImage(`${__dirname}/../assets/images/instagram-share-${this.theme == "light" ? "dark" : "light"}.png`), 280, canvas.height - 270, 80, 80);

      ctx.drawImage(await loadImage(`${__dirname}/../assets/images/instagram-other-${this.theme == "light" ? "dark" : "light"}.png`), canvas.width - 110, 60, 80, 80);

      if(this.isSaved) {
      ctx.drawImage(await loadImage(`${__dirname}/../assets/images/instagram-save-${this.theme == "light" ? "dark" : "light"}-filled.png`), canvas.width - 150, canvas.height - 270, 80, 80);
      } else {
      ctx.drawImage(await loadImage(`${__dirname}/../assets/images/instagram-save-${this.theme == "light" ? "dark" : "light"}.png`), canvas.width - 150, canvas.height - 270, 80, 80);
      }

    } catch (err) {
      console.log(err);
    };

    ctx.beginPath();
    ctx.arc(80, 87, 50, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();


    try {
      ctx.drawImage(await loadImage(this.avatar), 93 - 67, 37, 105, 105);
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

function formatLikes(number) {
  if (number >= 1000000) {
    return (number / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  } else if (number >= 1000) {
    return (number / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  } else {
    return number.toString();
  }
}

function timeAgo(timestamp) {
  const now = new Date();
  const past = new Date(timestamp);
  const seconds = Math.floor((now - past) / 1000);

  const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60,
      second: 1
  };

  for (const unit in intervals) {
      const interval = Math.floor(seconds / intervals[unit]);
      if (interval >= 1) {
          return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
      }
  }

  return 'just now';
}