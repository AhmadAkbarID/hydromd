const canvafy = require("../../index");

module.exports = {
  async image() {
    const image = await new canvafy.WelcomeLeave()
    .setAvatar("https://cdn.discordapp.com/avatars/928259219038302258/cb1bcc0c5616d3fb1527b4ea03c9ae17.png?size=1024")
    .setBackground("image", "https://th.bing.com/th/id/R.248b992f15fb255621fa51ee0ca0cecb?rik=K8hIsVFACWQ8%2fw&pid=ImgRaw&r=0")
    .setTitle(`${canvafy.author}`)
    .setDescription(`${canvafy.version}`)
    .setBorder(canvafy.Util.rgbToHex(255,0,0))
    .setAvatarBorder(canvafy.Util.rgbToHex(255,0,0))
    .setOverlayOpacity(0.9)
    .build();

    return image;
  },
  name: "welcome-leave"
};