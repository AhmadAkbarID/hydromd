const canvafy = require("../../index");

module.exports = {
  async image() {
    return await canvafy.Image.darkness("https://i.imgur.com/2pOpPKf.png", 100);
  },
  name: "darkness"
};