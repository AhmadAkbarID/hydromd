const axios = require('axios')
const cheerio = require('cheerio')

async function tiktok(url) {
    try {
        const r = await axios.post(
            'https://savetik.co/api/ajaxSearch',
            new URLSearchParams({ q: url, lang: 'id' }).toString(),
            {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Linux; Android 10)',
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-Requested-With': 'XMLHttpRequest',
                    origin: 'https://savetik.co',
                    referer: 'https://savetik.co/id1'
                }
            }
        )
        const $ = cheerio.load(r.data.data)
        return {
            status: true,
            title: $('h3').first().text().trim() || null,
            thumbnail: $('.image-tik img').attr('src') || $('.thumbnail img').attr('src') || null,
            mp4: $('.dl-action a:contains("MP4")').not(':contains("HD")').attr('href') || null,
            mp4_hd: $('.dl-action a:contains("HD")').attr('href') || null,
            mp3: $('.dl-action a:contains("MP3")').attr('href') || null,
            foto: $('.photo-list a[href*="snapcdn"]').map((_, e) => $(e).attr('href')).get()
        }
    } catch (e) {
        return {
            status: false,
            msg: e.message
        }
    }
}

module.exports = { tiktok }