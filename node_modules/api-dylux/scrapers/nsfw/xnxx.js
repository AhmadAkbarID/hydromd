const axios = require("axios")
const cheerio = require("cheerio")
const { parseFileSize, getFileSize } = require("../../utils/filesize")

async function xnxx(URL) {
  try {

    const response = await axios.get(URL, {
      headers: {
        "user-agent": "Mozilla/5.0"
      }
    })

    const $ = cheerio.load(response.data)

    const title = $('meta[property="og:title"]').attr("content")
    const thumb = $('meta[property="og:image"]').attr("content")

   const metadata = $("span.metadata").text().replace(/\n/g, "").trim()

let duration = null
let quality = null

if (metadata) {

  const durationMatch = metadata.match(/(\d+\s*(min|sec|s))/i)
  if (durationMatch) duration = durationMatch[1]

  const qualityMatch = metadata.match(/(\d{3,4}p)/i)
  if (qualityMatch) quality = qualityMatch[1]

}

    let url_dl = null

    $("script").each((i, el) => {
      const script = $(el).html()

      const match = script?.match(/html5player\.setVideoUrlHigh\('([^']+)'\)/)

      if (match) url_dl = match[1]
    })

    let size = "0 B"
    let sizeB = 0

    if (url_dl) {
      size = await getFileSize(url_dl)
      sizeB = parseFileSize(size)
    }

    return {
      title,
      duration,
      quality,
      thumb,
      size,
      sizeB,
      url_dl
    }

  } catch (error) {
    throw error
  }
}

module.exports = { xnxx }