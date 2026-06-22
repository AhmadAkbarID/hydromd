const canvafy = require("../../index");

module.exports = {
  async image() {
    const image = await new canvafy.Profile()
    .setUser("852103749228036136")
    .build();

    return image;
  },
  name: "profile"
};