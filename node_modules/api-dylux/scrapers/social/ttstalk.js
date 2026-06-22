const axios = require("axios")
const cheerio = require("cheerio")
const { author } = require("../../config")
const { formatViews } = require("../../utils/views")


async function ttstalk(username) {
    try {
        if (!username) {
            throw new Error("El nombre de usuario es obligatorio.");
        }

        const url = `https://www.tiktok.com/@${username}`;
        const response = await axios.get(url, {
            headers: { "User-Agent": "Mozilla/5.0" }
        });

        if (response.status !== 200) {
            throw new Error("Error al obtener la página de TikTok.");
        }

        const $ = cheerio.load(response.data);
        const scriptData = $('#__UNIVERSAL_DATA_FOR_REHYDRATION__').html();

        if (!scriptData) {
            throw new Error("No se encontraron datos en la página de TikTok.");
        }

        let parsedData;
        try {
            parsedData = JSON.parse(scriptData);
        } catch {
            throw new Error("Error al analizar los datos de TikTok.");
        }

        const userDetail = parsedData?.__DEFAULT_SCOPE__?.['webapp.user-detail'];

        if (!userDetail || !userDetail.userInfo) {
            throw new Error("Usuario no encontrado en TikTok.");
        }

        const { user, stats } = userDetail.userInfo;

        return {
            id: user?.id || null,
            username: user?.uniqueId || null,
            name: user?.nickname || null,
            avatar: user?.avatarLarger || null,
            bio: user?.signature || null,
            verified: user?.verified || false,
            followers: formatViews(stats?.followerCount || 0),
            following: formatViews(stats?.followingCount || 0),
            likes: formatViews(stats?.heart || 0),
            videos: formatViews(stats?.videoCount || 0),
            friends: formatViews(stats?.friendCount || 0)
        };
    } catch (error) {
        console.error("Error en tiktokStalk:", error.message);
        return { error: error.message };
    }
}

module.exports = { ttstalk }