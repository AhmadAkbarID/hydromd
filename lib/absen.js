const fs = require('fs')
const path = './database/absen.json'

if (!fs.existsSync(path)) fs.writeFileSync(path, '{}')

let absenList = JSON.parse(fs.readFileSync(path))

function saveAbsen() {
  fs.writeFileSync(path, JSON.stringify(absenList, null, 2))
}

function resetAbsen() {
  absenList = {}
  saveAbsen()
}

module.exports = {
  absenList,
  saveAbsen,
  resetAbsen
}