const canvafy = require("../../index");

module.exports = {
  async image() {
const image = await new canvafy.Instagram()
.setTheme("light")
.setUser({ username: "_berknt" })
.setLike({count: 1200, likeText: "like"})
.setVerified(true)
.setStory(true)
.setPostDate(Date.now() - 1000 * 60 * 60 * 24 * 2)
.setAvatar("https://instagram.fist11-1.fna.fbcdn.net/v/t51.2885-19/322045861_132323016348153_7836758904793288977_n.jpg?stp=dst-jpg_s150x150&_nc_ht=instagram.fist11-1.fna.fbcdn.net&_nc_cat=109&_nc_ohc=U74iCxQMkukQ7kNvgEKgFW9&edm=AEhyXUkBAAAA&ccb=7-5&oh=00_AYCdS5FnAQv5unZqvoGUjyyej1GEkOXkTB-iKOPd-RqLpA&oe=66D97ECE&_nc_sid=8f1549")
.setPostImage("https://instagram.fist11-1.fna.fbcdn.net/v/t51.29350-15/323080696_1192883638039438_2597267999547197904_n.webp?stp=dst-jpg_e35&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi4xMDgweDEwODAuc2RyLmYyOTM1MC5kZWZhdWx0X2ltYWdlIn0&_nc_ht=instagram.fist11-1.fna.fbcdn.net&_nc_cat=110&_nc_ohc=yyRUIVcIXHMQ7kNvgHDtLX4&edm=AEhyXUkBAAAA&ccb=7-5&ig_cache_key=MzAwNDk0NTU5NzIyOTEyNzExOA%3D%3D.3-ccb7-5&oh=00_AYAg82IKUTfAskYa13RvRky4RhMgM0ZxFGEjNElUtyGbpA&oe=66D97D46&_nc_sid=8f1549")
.setLiked(true)
.setSaved(true)
.build();
    return image;
  },
  name: "instagram"
};