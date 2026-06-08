const axios = require('axios');

const headers = {
    authority: 'api.sylica.eu.org',
    origin: 'https://www.kauruka.com',
    referer: 'https://www.kauruka.com/',
    'user-agent': 'Postify/1.0.0'
};
async function extractId(link) {
    const match = link.match(/s\/([a-zA-Z0-9]+)$|surl=([a-zA-Z0-9]+)$/);
    return match ? (match[1] || match[2]) : null;
}
async function response(data, includeDL = false) {
    const response = {
        filename: data.filename,
        size: data.size,
        shareid: data.shareid,
        uk: data.uk,
        sign: data.sign,
        timestamp: data.timestamp,
        createTime: data.create_time,
        fsId: data.fs_id,
        message: data.message || 'Gak tau 🙂‍↔️'
    };

    if (includeDL) {
        response.dlink = data.downloadLink;
   }
    return response;
}
const terabox = {
    detail: async function (link) {
        const id = await extractId(link);
        if (!id) throw new Error('Masukin link terabox-nya yang bener!!! Gua colok juga nanti mata sia 🫵');

        try {
            const { data } = await axios.get(`https://api.sylica.eu.org/terabox/?id=${id}`, { headers });
            return await response(data.data);
        } catch (error) {
            console.error(error);
            throw new Error('Error ceunah bree 🗿');
        }
    },
    dl: async function (link) {
        const id = await extractId(link);
        if (!id) throw new Error('Masukin link terabox-nya yang bener!!! Gua colok juga nanti mata sia 🫵');
        try {
            const { data } = await axios.get(`https://api.sylica.eu.org/terabox/?id=${id}&download=1`, { headers });
            return await response(data.data, true);
        } catch (error) {
            console.error(error);
            throw new Error('Error ceunah bree 🗿');
        }
    }
};
module.exports = { terabox };
