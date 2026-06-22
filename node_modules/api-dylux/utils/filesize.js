const axios = require("axios")

function parseFileSize(size) {
  if (!size) return 0

  const units = {
    B: 1,
    KB: 1024,
    MB: 1024 ** 2,
    GB: 1024 ** 3,
    TB: 1024 ** 4
  }

  const match = size.toString().trim().match(/([\d.]+)\s*(B|KB|MB|GB|TB)/i)
  if (!match) return 0

  const value = parseFloat(match[1])
  const unit = match[2].toUpperCase()

  return Math.round(value * units[unit])
}

function formatFileSize(bytes) {
  if (!bytes || isNaN(bytes)) return "0 B"

  const units = ["B", "KB", "MB", "GB", "TB"]
  let i = 0

  while (bytes >= 1024 && i < units.length - 1) {
    bytes /= 1024
    i++
  }

  let value = bytes.toFixed(1)

  if (value.endsWith(".0")) value = parseInt(value)

  return `${value} ${units[i]}`
}

// obtener tamaño desde link
async function getFileSize(url) {
  try {

    const res = await axios.head(url)

    const bytes = parseInt(res.headers["content-length"] || 0)

    return formatFileSize(bytes)

  } catch (e) {

    return "0 B"

  }
}

module.exports = { parseFileSize, formatFileSize, getFileSize }