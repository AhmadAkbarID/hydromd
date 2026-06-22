const axios = require("axios")
const cheerio = require("cheerio")
const { author } = require("../../config")

async function getsticker(query) {

  const { data } = await axios.get(`https://getstickerpack.com/stickers?query=${query}`)
  const $ = cheerio.load(data)

  let source = []
  let link = []

  $('#stickerPacks > div > div:nth-child(3) > div > a').each((i, el) => {
    source.push($(el).attr('href'))
  })

  const random = source[Math.floor(Math.random() * source.length)]

  const res = await axios.get(random)
  const $$ = cheerio.load(res.data)

  $$('#stickerPack > div > div.row > div > img').each((i, el) => {
    link.push($$(el).attr('src').replace(/&d=200x200/g, ''))
  })

  return {
    status: 200,
    author,
    title: $$('#intro > div > div > h1').text(),
    sticker_url: link
  }
}

module.exports = { getsticker }