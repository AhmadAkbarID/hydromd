const canvafy = require("../../index.js");
module.exports = {
  async image() {
    const image = await new canvafy.Rank({ font: { name: "Poppins", path: `assets/fonts/Poppins/Poppins-Regular.ttf` }})
    .setAvatar("https://cdn.discordapp.com/avatars/928259219038302258/cb1bcc0c5616d3fb1527b4ea03c9ae17.png?size=2048")
    .setBackground("image", "https://cdn.discordapp.com/attachments/1134192382137602048/1134198013225607188/Er3o0odXEAAAEhV.jpg")
    .setUsername("fivesobes")
    .setBorder("#ff0000")
    .setLevel(22)
    .setOverlayOpacity(0.8)
    .setRank(38)
    .setCurrentXp(495)
    .setBarColor("#ff0000")
    .setRequiredXp(700)
    .build();

    return image;
  },
  name: "rank"
};