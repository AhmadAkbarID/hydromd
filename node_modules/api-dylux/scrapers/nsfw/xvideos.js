const axios = require("axios")
const cheerio = require("cheerio")
const { formatFileSize, parseFileSize, getFileSize } = require("../../utils/filesize")
const { author } = require("../../config")
const { formatViews } = require("../../utils/views")

async function xvideos(url) {
  try {

    const response = await axios.get(url, {
      headers: {
        "user-agent": "Mozilla/5.0"
      }
    })

    const html = response.data
    const $ = cheerio.load(html)

    const title = $("meta[property='og:title']").attr("content")

    const views = formatViews($("div#video-tabs strong.mobile-hide").text())
    const vote = formatViews($("div.rate-infos span.rating-total-txt").text())

    const likes = $("span.rating-good-nbr").text()
    const deslikes = $("span.rating-bad-nbr").text()

    const thumb = $("meta[property='og:image']").attr("content")

    const url_dl = $("#html5video > #html5video_base > div > a").attr("href")

    const size = await getFileSize(url_dl)
    const sizeB = parseFileSize(size)

    return {
      title,
      views,
      vote,
      likes,
      deslikes,
      size,
      sizeB,
      thumb,
      url_dl
    }

  } catch (error) {
    throw error
  }
}

module.exports = { xvideos }