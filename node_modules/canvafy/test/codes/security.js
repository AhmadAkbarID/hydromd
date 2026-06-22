const canvafy = require("../../index");

module.exports = {
  async image() {
    const image = await new canvafy.Security()
    .setAvatar("https://cdn.discordapp.com/avatars/928259219038302258/cb1bcc0c5616d3fb1527b4ea03c9ae17.png?size=1024")
    .setBackground("image", "https://cdn.discordapp.com/attachments/1087030211813593190/1110243947311288530/beeautiful-sunset-illustration-1212023.webp")
    .setCreatedTimestamp(1641384644041)
    .setSuspectTimestamp(1841384644041)
    .setBorder("#f0f0f0")
    .setLocale("en")
    .setAvatarBorder("#f0f0f0")
    .setOverlayOpacity(0.9)
    .build();

    return image;
  },
  name: "security"
};