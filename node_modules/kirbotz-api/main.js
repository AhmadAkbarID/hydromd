const Islami = require('./islami.js')
const Downloader = require('./downloader.js')

module.exports.AsmaulHusna = Islami.asmaulHusna
module.exports.AyatKursi = Islami.ayatKursi
module.exports.BacaanShalat = Islami.bacaanShalat
module.exports.DoaHarian = Islami.doaHarian

module.exports.YtMp4 = Downloader.ytMp4
module.exports.YtMp3 = Downloader.ytMp3
module.exports.YtPlayMp4 = Downloader.ytPlaymp4
module.exports.YtPlayMp3 = Downloader.ytPlaymp3
module.exports.TikTok = Downloader.tikTok
module.exports.MediaFire = Downloader.mediaFire