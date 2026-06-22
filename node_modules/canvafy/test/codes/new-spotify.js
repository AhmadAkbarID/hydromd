const canvafy = require("../../index");

module.exports = {
  async image() {
    const image = await new canvafy.Spotify()
    .setAuthor("Sagopa Kajmer, Şehinşah")
    .setAlbum("Kağıt Kesikleri")
    .setTimestamp(121000,263400)
    .setImage("https://i.scdn.co/image/ab67616d00001e02621fe38a73b2a45e9be957d3")
    .setTitle("Bla Bla Bla Bla")
    .setBlur(5)
    .setOverlayOpacity(0.7)
    .build();

    return image;
  },
  name: "spotify"
};