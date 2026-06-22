const axios = require("axios")
const cheerio = require("cheerio")
const qs = require('qs')
const { author } = require("../../config")

async function npm(query) {
  try {

    const response = await axios.get(`https://registry.npmjs.org/${query}`)
    const data = response.data

    const { name, description } = data
    const version = data['dist-tags'].latest

    const packageLink = `https://www.npmjs.com/package/${name}`

    const lastSlashIndex = name.lastIndexOf('/')
    const packageName = lastSlashIndex !== -1
      ? name.substring(lastSlashIndex + 1)
      : name

    const downloadLink = `https://registry.npmjs.org/${name}/-/${packageName}-${version}.tgz`

    const npmPackageResponse = await axios.get(packageLink, {
      headers: {
        accept: "text/html,application/xhtml+xml",
        "accept-language": "en-US,en;q=0.9",
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36"
      }
    })

    const $ = cheerio.load(npmPackageResponse.data)

    const publishedDate = $('time').first().text() || null

    const owner = data.maintainers?.[0]?.name || null
    const keywords = data.keywords || []
    const homepage = data.homepage || null
    const license = data.license || null

    const dependencies = data.versions?.[version]?.dependencies || {}

    const readme =
      $('div.markdown').html() ||
      $('div[class*="markdown"]').html() ||
      null

    return {
      name,
      description,
      version,
      packageLink,
      packageName,
      downloadLink,
      publishedDate,
      owner,
      keywords,
      homepage,
      license,
      dependencies,
      readme
    }

  } catch (err) {
    throw new Error('Error al buscar información del paquete: ' + err.message)
  }
}

module.exports = { npm }