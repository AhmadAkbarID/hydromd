const axios = require("axios")
const cheerio = require("cheerio")
const qs = require('qs')
const { author } = require("../../config")
const { formatViews } = require("../../utils/views")


async function tiktok(url) {
    let response = await axios.get(`https://tikwm.com/api/?url=${url}`)
    let result = response.data
    return {
      result: result.data
    }

  }

module.exports = { tiktok }