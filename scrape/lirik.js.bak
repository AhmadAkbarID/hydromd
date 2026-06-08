const axios = require('axios');

/**
 * LrcLib Lyrics Scraper
 * Diropea ku: Agung
 */
const Lyrics = {
    search: async (title) => {
        try {
            if (!title) return { status: 400, success: false, message: "Judulna naon euy? Eusian heula!" };

            // Nembak API LrcLib
            const { data } = await axios.get(`https://lrclib.net/api/search?q=${encodeURIComponent(title)}`, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36'
                }
            });

            if (!data || !data[0]) throw new Error("Lirikna teu kapanggih.");

            const song = data[0];
            const lyricsRaw = song.plainLyrics || song.syncedLyrics;

            if (!lyricsRaw) throw new Error("Aya laguna tapi euweuh lirikna.");

            // Hapus tag waktu [00:00.00] agar bersih
            const cleanLyrics = lyricsRaw.replace(/\[.*?\]/g, '').trim();

            const disclaimer = "\n\n---\n_**Educational Purpose Only**_";

            // Balikeun hasilna
            return {
                status: 200,
                success: true,
                data: {
                    trackName: song.trackName,     // Disesuaikan agar terbaca di case
                    artistName: song.artistName,   // Disesuaikan agar terbaca di case
                    albumName: song.albumName,     // Disesuaikan agar terbaca di case
                    duration: song.duration,       // Biarkan angka (detik) agar bisa dihitung di case
                    lyrics: cleanLyrics + disclaimer
                }
            };

        } catch (err) {
            return {
                status: 500,
                success: false,
                message: err.message
            };
        }
    }
};

module.exports = Lyrics;