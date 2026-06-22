const canvafy = require("../../index");

module.exports = {
  async image() {
    const image = await new canvafy.LevelUp()
    .setAvatar("https://cdn.discordapp.com/avatars/928259219038302258/cb1bcc0c5616d3fb1527b4ea03c9ae17.png?size=1024")
    .setBackground("image", "https://cdn.discordapp.com/attachments/1041745966186909826/1096055377289814126/e4a8a79fccae98487a74d8bd1f2357834dfa7295.png")
    .setUsername("Beş")
    .setBorder("#000000")
    .setAvatarBorder("#ff0000")
    .setOverlayOpacity(0.7)
    .build();

    return image;
  },
  name: "level-up"
};