const axios = require('axios');
const cheerio = require('cheerio');

async function searchDafont(q) {
    let url = 'https://www.dafont.com/search.php?q=' + encodeURIComponent(q);
    let { data } = await axios.get(url);
    let $ = cheerio.load(data);
    let result = [];

    $('.lv1left.dfbg').each((i, el) => {
        let base = $(el);
        let lv2 = base.nextAll('.lv2right').first();
        let dlbox = base.nextAll('.dlbox').first();
        let previewBox = base.nextAll('.preview').first();

        let raw = base.text().replace(/\s+/g, ' ').trim();
        let author = base.find('a').first().text().trim();
        let name = raw.replace(/\s*by\s*.+$/i, '').trim();
        let info = lv2.find('.light').text().trim();
        let downloads = info.match(/[\d,]+ downloads/)?.[0] || 'Unknown';

        let dl = dlbox.find('a.dl').attr('href');
        let download = dl ? 'https:' + dl : null;

        let style = previewBox.attr('style');
        let preview = style ? 'https://www.dafont.com' + (style.match(/url\((.*?)\)/)?.[1] || '') : null;

        if (download) {
            result.push({ name, author, downloads, download, preview });
        }
    });

    return result;
}

module.exports = { searchDafont };