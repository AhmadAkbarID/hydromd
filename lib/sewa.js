const fs = require("fs")

function addSewaGroup(id, waktu, sewa) {
    let expired = (waktu === "PERMANENT") ? "PERMANENT" : (Date.now() + toMs(waktu))
    let obj = { id: id, expired: expired }
    sewa.push(obj)
    fs.writeFileSync('./database/sewa.json', JSON.stringify(sewa, null, 2))
    return true
}

function checkSewaGroup(id, sewa) {
    return sewa.some(x => x.id === id)
}

function getSewaPosition(id, sewa) {
    return sewa.findIndex(x => x.id === id)
}

function toMs(str) {
    let number = parseInt(str)
    let unit = str[str.length - 1]
    if (unit === 'd') return number * 24 * 60 * 60 * 1000
    if (unit === 'h') return number * 60 * 60 * 1000
    if (unit === 'm') return number * 60 * 1000
    if (unit === 's') return number * 1000
    if (unit === 'y') return number * 365 * 24 * 60 * 60 * 1000
    return number
}

function msToDate(ms) {
    let days = Math.floor(ms / (24 * 60 * 60 * 1000))
    let daysms = ms % (24 * 60 * 60 * 1000)
    let hours = Math.floor(daysms / (60 * 60 * 1000))
    let hoursms = ms % (60 * 60 * 1000)
    let minutes = Math.floor(hoursms / (60 * 1000))
    let minutesms = ms % (60 * 1000)
    let sec = Math.floor(minutesms / 1000)
    return days + "d " + hours + "h " + minutes + "m " + sec + "s"
}

function expiredCheck(sewa) {
    let now = Date.now()
    let filtered = sewa.filter(x => x.expired === "PERMANENT" || x.expired > now)
    fs.writeFileSync('./database/sewa.json', JSON.stringify(filtered, null, 2))
    return filtered
}

async function remindSewa(hydro, sewa) {
    for (let x of sewa) {
        if (x.expired !== "PERMANENT") {
            let remaining = x.expired - Date.now()
            if (remaining <= 24 * 60 * 60 * 1000 && remaining > 23 * 60 * 60 * 1000) {
                await hydro.sendMessage(x.id, { text: "⚠️ Sewa bot akan berakhir dalam 1 hari!" })
            }
            if (remaining <= 60 * 60 * 1000 && remaining > 59 * 60 * 1000) {
                await hydro.sendMessage(x.id, { text: "⚠️ Sewa bot akan berakhir dalam 1 jam!" })
            }
        }
    }
}

async function getGcName(id) {
    try {
        let metadata = await global.hydro.groupMetadata(id)
        return metadata.subject
    } catch {
        return "Tidak diketahui"
    }
}


function addPendingSewa(link, waktu) {
    let pending = JSON.parse(fs.readFileSync('./database/pendingSewa.json'))
    pending.push({ link, waktu })
    fs.writeFileSync('./database/pendingSewa.json', JSON.stringify(pending, null, 2))
}

function getPendingSewa() {
    return JSON.parse(fs.readFileSync('./database/pendingSewa.json'))
}

function clearPendingSewa(link) {
    let pending = JSON.parse(fs.readFileSync('./database/pendingSewa.json'))
    pending = pending.filter(x => x.link !== link)
    fs.writeFileSync('./database/pendingSewa.json', JSON.stringify(pending, null, 2))
}

module.exports = { 
    addSewaGroup, 
    checkSewaGroup, 
    getSewaPosition, 
    toMs, 
    msToDate, 
    expiredCheck, 
    remindSewa, 
    getGcName,
    addPendingSewa,
    getPendingSewa,
    clearPendingSewa
}