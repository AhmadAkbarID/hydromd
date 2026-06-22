const canvafy = require("../../index");

module.exports = {
  async image() {
    return await canvafy.Image.greyscale("https://i.imgur.com/2pOpPKf.png");
  },
  name: "greyscale"
};