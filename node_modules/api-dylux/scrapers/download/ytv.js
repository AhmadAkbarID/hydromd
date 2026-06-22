const axios = require("axios")
const cheerio = require("cheerio")
const qs = require('qs')
const { author } = require("../../config")
const { formatFileSize, parseFileSize, getFileSize } = require("../../utils/filesize")

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

async function ytv(url, calidad = '360p') {

    const { data } = await axios.post(
        "https://app.ytdown.to/proxy.php",
        new URLSearchParams({ url }),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    )

    const api = data.api
    if (api?.status == "ERROR") throw api.message

    let media = api.mediaItems

    let qualities = media.map((v, i) => {

        let match = v.mediaUrl.match(/(\d+)p|(\d+)k/)
        let res = match ? match[0] : null

        return {
            id: i + 1,
            type: v.type,
            quality: res,
            label: `${v.mediaExtension.toUpperCase()} - ${v.mediaQuality}`,
            size: v.mediaFileSize,
            mediaUrl: v.mediaUrl,
            duration: v.mediaDuration
        }
    })

    if (calidad) {

        calidad = calidad.toLowerCase()

        let selected = qualities.find(v => v.quality?.toLowerCase() === calidad)

        if (!selected) {
            let disponibles = qualities
                .filter(v => v.quality)
                .map(v => v.quality)
                .join(", ")

            throw `Calidad ${calidad} no disponible\nDisponibles: ${disponibles}`
        }

        // convertir a link directo
        let direct = await download(selected.mediaUrl)

        return {
            title: api.title,
            thumb: api.imagePreviewUrl,
            id: selected.id,     
            duration: selected.duration,
            quality: selected.quality,
            size: selected.size,
            sizeB: parseFileSize(selected.size),
            dl_url: direct
        }
    }

    return {
        title: api.title,
        uploader: api.userInfo?.name,
        views: api.mediaStats?.viewsCount,
        thumbnail: api.imagePreviewUrl,
        qualities
    }
}

async function download(mediaUrl) {

    while (true) {

        let { data } = await axios.get(mediaUrl)

        if (
            data?.percent === "Completed" &&
            data?.fileUrl !== "In Processing..."
        ) {
            return data.fileUrl
        }

        await delay(4000)
    }
}

module.exports = { ytv }