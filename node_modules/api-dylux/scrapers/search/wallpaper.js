const axios = require("axios")
const cheerio = require("cheerio")

async function wallpaper(title, page = 1) {

  const { data } = await axios.get(
    "https://www.besthdwallpaper.com/search",
    {
      params: {
        CurrentPage: page,
        q: title
      },
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"
      }
    }
  )

  const $ = cheerio.load(data)
  let results = []

  $("div.grid-item").each((_, el) => {

    let img = $(el).find("picture img").attr("data-src") ||
              $(el).find("picture img").attr("src")

    let title = $(el).find("picture img").attr("alt") || "Wallpaper"

    if (img && !img.startsWith("http")) {
      img = "https://www.besthdwallpaper.com" + img
    }

    results.push({
      title,
      image: img
    })

  })

  return results
}

module.exports = { wallpaper }