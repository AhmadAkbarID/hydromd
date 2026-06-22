Object.defineProperty(exports, "__esModule", { value: true });
const { registerFont } = require("canvas");
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const path = require("path");

const { GlobalFonts } = require('@napi-rs/canvas');

GlobalFonts.registerFromPath(`${__dirname}/assets/fonts/Poppins/Poppins-Regular.ttf`,"Poppins")
GlobalFonts.registerFromPath(`${__dirname}/assets/fonts/Poppins/Poppins-Bold.ttf`,"Poppins Bold")
GlobalFonts.registerFromPath(`${__dirname}/assets/fonts/Manrope/Manrope-Regular.ttf`,"Manrope")
GlobalFonts.registerFromPath(`${__dirname}/assets/fonts/Manrope/Manrope-Bold.ttf`,"Manrope Bold")
GlobalFonts.registerFromPath(`${__dirname}/assets/fonts/Others/AbyssinicaSIL-Regular.ttf`,"Abyss")
GlobalFonts.registerFromPath(`${__dirname}/assets/fonts/Others/ChirpRegular.ttf`,"Chirp")

const { emitWarning } = process;
process.emitWarning = (warning, ...args) => {
  if (args[0] === 'ExperimentalWarning') { return; }
  if (args[0] && typeof args[0] === 'object' && args[0].type === 'ExperimentalWarning') { return; }
  return emitWarning(warning, ...args);
};


module.exports = {
  Image: {
    affect: require("./src/affect"),
    batslap: require("./src/batslap"),
    beautiful: require("./src/beautiful"),
    darkness: require("./src/darkness"),
    delete: require("./src/delete"),
    gay: require("./src/gay"),
    greyscale: require("./src/greyscale"),
    invert: require("./src/invert"),
    kiss: require("./src/kiss"),
  },
  oldRank: require("./src/oldrank"),
  Rank: require("./src/rank"),
  oldSpotify: require("./src/oldspotify"),
  Spotify: require("./src/spotify"),
  Util: require("./plugins/Util"),
  WelcomeLeave: require("./src/welcome-leave"),
  Ship: require("./src/ship"),
  Top: require("./src/top"),
  LevelUp: require("./src/level-up"),
  Profile: require("./src/profile"),
  Security: require("./src/security"),
  Captcha: require("./src/captcha"),
  Tweet: require("./src/tweet"),
  Instagram: require("./src/instagram"),
  author: "Bes-js",
  version: require("./package.json").version
};