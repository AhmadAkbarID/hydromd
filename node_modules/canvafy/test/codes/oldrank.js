const canvafy = require("../../index");

module.exports = {
  async image() {
    const image = await new canvafy.oldRank({ font: { name: "Poppins", path: `assets/fonts/Poppins/Poppins-Regular.ttf` }})
    .setAvatar("https://i.imgur.com/2pOpPKf.png")
    .setForegroundOpacity(0.8)
    .setBackground("image", "https://th.bing.com/th/id/R.248b992f15fb255621fa51ee0ca0cecb?rik=K8hIsVFACWQ8%2fw&pid=ImgRaw&r=0")
    .setUsername("squarfiuz")
    .setDiscriminator("7777")
    .setStatus("online")
    .setBorder("#ff0000")
    .setLevel(2)
    .setRank(3)
    .setCurrentXp(100)
    .setRequiredXp(500)
    .setRankColor({text:"#ff0000", number:"#00ff00" })
    .build();

    return image;
  },
  name: "old-rank"
};