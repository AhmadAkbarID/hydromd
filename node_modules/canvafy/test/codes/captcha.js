const canvafy = require("../../index");

module.exports = {
  async image() {
    const image = await new canvafy.Captcha()
    .setBackground("image", "https://cdn.discordapp.com/attachments/1087030211813593190/1110243947311288530/beeautiful-sunset-illustration-1212023.webp")
    .setCaptchaKey(canvafy.Util.captchaKey(21))
    .setBorder("#f0f0f0")
    .setOverlayOpacity(0.7)
    .build();

    return image;
  },
  name: "captcha"
};