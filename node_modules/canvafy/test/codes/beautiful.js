const canvafy = require("../../index");

module.exports = {
  async image() {
    return await canvafy.Image.beautiful("https://i.imgur.com/2pOpPKf.png");
  },
  name: "beautiful"
};