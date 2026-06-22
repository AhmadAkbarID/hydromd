const canvafy = require("../../index");

module.exports = {
  async image() {
    const image = await new canvafy.Ship()
    .setAvatars("https://cdn.discordapp.com/avatars/928259219038302258/cb1bcc0c5616d3fb1527b4ea03c9ae17.png?size=1024", "https://cdn.discordapp.com/avatars/928259219038302258/cb1bcc0c5616d3fb1527b4ea03c9ae17.png?size=1024")
    .setBackground("image", "https://cdn.discordapp.com/attachments/1041745966186909826/1090682446061768785/4274ddfe137eba068137b4e149578f4c.jpg")
    .setBorder("#f0f0f0")
    .setOverlayOpacity(0.8)
    .build();

    return image;
  },
  name: "ship"
};