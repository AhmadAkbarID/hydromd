const axios = require('axios');
const cheerio = require('cheerio');

class Genius {
  constructor() {
    this.baseUrl = 'https://genius.com';
    this.headers = {
      'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
      'Referer': this.baseUrl + '/'
    };
  }

  async searchSongUrl(query) {
    try {
        const searchUrl = `${this.baseUrl}/api/search/multi?per_page=1&q=${encodeURIComponent(query)}`;
        const response = await axios.get(searchUrl, { headers: this.headers });
        
        const sections = response.data.response.sections;
        let songUrl = null;
        
        for (const section of sections) {
          if (section.type === 'song' && section.hits.length > 0) {
            songUrl = section.hits[0].result.url;
            break;
          }
        }
        
        return songUrl;
    } catch (error) {
        return null;
    }
  }

  async getSongDetails(url) {
    const response = await axios.get(url, { headers: this.headers });
    const $ = cheerio.load(response.data);
    
    const title = $('h1.SongHeader-desktop__Title-sc-908aafe9-9').text().trim() || $('h1[class^="SongHeader"]').text().trim();
    const primaryArtist = $('.SongHeader-desktop__CreditList-sc-908aafe9-16 a').first().text().trim() || $('a[class^="SongHeader"]').first().text().trim();
    const album = $('.SongHeader-desktop__AlbumCredit-sc-908aafe9-12 a').first().text().trim() || 'Unknown Album';
    
    const lyrics = [];
    $('[class^="Lyrics__Container"]').each((i, el) => {
      const lines = [];
      $(el).contents().each((j, node) => {
        if (node.type === 'text') {
          lines.push($(node).text().trim());
        } else if (node.type === 'tag') {
          if (node.name === 'a') {
            const linkText = $(node).text().trim();
            if (linkText) lines.push(linkText);
          } else if (node.name === 'br') {
            lines.push('\n');
          } else if (node.name === 'i' || node.name === 'b') {
            lines.push($(node).text().trim());
          }
        }
      });
      lyrics.push(lines.join(' ').replace(/\n\s+/g, '\n'));
    });
    
    return { title, artist: primaryArtist, album, lyrics: lyrics.join('\n').replace(/\n+/g, '\n') };
  }
}

const GeniusScraper = new Genius();

const Lyrics = {
    v1: async (title) => {
        try {
            if (!title) return { status: 400, success: false, message: global.mess.query.text };

            const { data } = await axios.get(`https://lrclib.net/api/search?q=${encodeURIComponent(title)}`, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K)' }
            });

            if (!data || !data[0]) throw new Error("Not Found");

            const song = data[0];
            const lyricsRaw = song.plainLyrics || song.syncedLyrics;

            if (!lyricsRaw) throw new Error("No Lyrics");

            const cleanLyrics = lyricsRaw.replace(/\[.*?\]/g, '').trim();
            const disclaimer = "\n\n---\n> Source: LrcLib";

            return {
                status: 200,
                success: true,
                data: {
                    trackName: song.trackName,
                    artistName: song.artistName,
                    albumName: song.albumName,
                    duration: song.duration,
                    lyrics: cleanLyrics + disclaimer
                }
            };
        } catch (err) {
            return { status: 500, success: false, message: global.mess.error.fitur };
        }
    },

    v2: async (title) => {
        try {
            if (!title) return { status: 400, success: false, message: global.mess.query.text };

            const url = await GeniusScraper.searchSongUrl(title);
            if (!url) throw new Error("Not Found");

            const result = await GeniusScraper.getSongDetails(url);
            if (!result.lyrics) throw new Error("No Lyrics");

            const disclaimer = "\n\n---\n> Source: Genius";

            return {
                status: 200,
                success: true,
                data: {
                    trackName: result.title || title,
                    artistName: result.artist || "Unknown Artist",
                    albumName: result.album || "Unknown Album",
                    duration: null,
                    lyrics: result.lyrics.trim() + disclaimer
                }
            };
        } catch (err) {
            return { status: 500, success: false, message: global.mess.error.fitur };
        }
    },

    auto: async (title) => {
        let result = await Lyrics.v1(title);
        
        if (!result.success) {
            result = await Lyrics.v2(title);
        }
        return result;
    },

    search: async (title) => {
        return await Lyrics.auto(title);
    }
};

module.exports = Lyrics;