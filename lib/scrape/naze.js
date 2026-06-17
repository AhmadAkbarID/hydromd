const axios = require('axios');

async function searchSpotify(query) {
    try {
        let keys = [];
        
        if (typeof global.nazekey !== 'undefined' && global.nazekey) {
            if (Array.isArray(global.nazekey)) {
                keys = global.nazekey;
            } else if (typeof global.nazekey === 'string') {
                keys = global.nazekey.split(',').map(k => k.trim()).filter(k => k !== '');
            }
        }

        if (keys.length === 0) {
            throw new Error("API Key Naze belum disetting di settings.js");
        }

        let tracks = null;

        for (let i = 0; i < keys.length; i++) {
            try {
                const currentKey = keys[i];
                const url = `https://api.naze.biz.id/search/spotify?query=${encodeURIComponent(query)}&apikey=${currentKey}`;
                
                const response = await axios.get(url, { timeout: 15000 });
                
                let resData = response.data?.result || response.data?.data;
                
                if (resData && Array.isArray(resData) && resData.length > 0) {
                    tracks = resData;
                    break;
                }
            } catch (err) {
                continue;
            }
        }

        if (!tracks || !Array.isArray(tracks) || tracks.length === 0) {
            throw new Error("Semua API Key limit, server sedang mati, atau lagu tidak ditemukan!");
        }

        return tracks.map(track => {
            return {
                name: track.title || 'Tanpa Judul',
                artists: track.artist || 'Unknown',
                popularity: track.popularity || 'N/A',
                link: track.url || 'Tidak ada link',
                thumbnail: track.thumbnail || null,
                duration: track.duration || null
            };
        }).slice(0, 20);

    } catch (error) {
        // Log ini akan muncul jika API sedang bermasalah, tapi tidak akan membuat bot crash
        console.error("Peringatan dari Naze API:", error.message);
        return [];
    }
}

module.exports = { searchSpotify };