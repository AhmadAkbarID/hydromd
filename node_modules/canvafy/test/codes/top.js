const canvafy = require("../../index");

module.exports = {
  async image() {
const image = await new canvafy.Top()
.setOpacity(0.6)
.setScoreMessage("Message:")
.setabbreviateNumber(true)
.setBackground("image", "https://cdn.wallpapersafari.com/1/71/YB4ECo.jpg")
.setColors({ box: '#212121', username: '#ffffff', score: '#ffffff', firstRank: '#f7c716', secondRank: '#9e9e9e', thirdRank: '#94610f' })
.setUsersData([
{ top: 1, avatar: "https://cdn.discordapp.com/embed/avatars/0.png", tag: "Beş#0005", score: 5555 },
{ top: 2, avatar: "https://cdn.discordapp.com/embed/avatars/0.png", tag: "Lulushu#1337", score: 1337 },
{ top: 3, avatar: "https://cdn.discordapp.com/embed/avatars/0.png", tag: "Approval.#0001", score: 1054 },
{ top: 4, avatar: "https://cdn.discordapp.com/embed/avatars/0.png", tag: "luhux#1937", score: 903 },
{ top: 5, avatar: "https://cdn.discordapp.com/embed/avatars/0.png", tag: "Deleted User#0000", score: 0 },
{ top: 6, avatar: "https://cdn.discordapp.com/embed/avatars/0.png", tag: "Deleted User#0000", score: 0 },
{ top: 7, avatar: "https://cdn.discordapp.com/embed/avatars/0.png", tag: "Deleted User#0000", score: 0 },
{ top: 8, avatar: "https://cdn.discordapp.com/embed/avatars/0.png", tag: "Deleted User#0000", score: 0 },
{ top: 9, avatar: "https://cdn.discordapp.com/embed/avatars/0.png", tag: "Deleted User#0000", score: 0 },
{ top: 10, avatar: "https://cdn.discordapp.com/embed/avatars/0.png", tag: "Deleted User#0000", score: 0 },
    ])
.build();

    return image;
  },
  name: "top"
};