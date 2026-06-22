const axios = require("axios")

async function gimage(query) {

  const { data } = await axios.get("https://www.google.com/search", {
    params: {
      q: query,
      tbm: "isch"
    },
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9"
    }
  })

  const results = []
  const regex = /"https?:\/\/[^"]+\.(jpg|jpeg|png|webp)"/g

  const matches = data.match(regex) || []

  for (let url of matches) {
    url = url.replace(/"/g, "")
    if (!results.includes(url)) results.push(url)
  }

  return results
}

module.exports = { gimage }