const canvafy = require("../../index");

module.exports = {
  async image() {
    return await canvafy.Image.batslap("https://i.imgur.com/2pOpPKf.png", "https://i.imgur.com/2pOpPKf.png");
  },
  name: "batslap"
};