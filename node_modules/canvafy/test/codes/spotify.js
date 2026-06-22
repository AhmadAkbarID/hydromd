const canvafy = require("../../index");

module.exports = {
  async image() {
    const image = await new canvafy.oldSpotify()
    .setAuthor("Alan Walker, Ava Max")
    .setAlbum("Alan Walker Album")
    .setBackground("image", "https://cdn.wallpapersafari.com/1/71/YB4ECo.jpg")
    .setTimestamp(5000, 17900)
    .setImage("https://i.scdn.co/image/ab67616d00001e02df9a35baaa98675256b35177")
    .setTitle("Alone, Pt II")
    .setForegroundOpacity(0.5)
    .build();

    return image;
  },
  name: "spotify"
};