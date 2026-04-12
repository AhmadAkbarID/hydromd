const axios = require('axios');

async function tiktokDl(url) {
    return new Promise(async (resolve, reject) => {
        try {
            let data = [];
            
            function formatNumber(integer) {
                let numb = parseInt(integer);
                return Number(numb).toLocaleString().replace(/,/g, '.');
            }

            function formatDate(n, locale = 'id') {
                let d = new Date(Number(n) * 1000);
                return d.toLocaleDateString(locale, {
                    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                    hour: 'numeric', minute: 'numeric', second: 'numeric'
                });
            }

            async function expandTikTokUrl(u) {
                if (!/https?:\/\/(vt|vm)\.tiktok\.com\//i.test(u)) return u;
                const r = await axios.get(u, {
                    timeout: 20000,
                    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
                    validateStatus: () => true
                });
                return r.request?.res?.responseUrl || u;
            }

            const expanded = await expandTikTokUrl(url);
            const form = new URLSearchParams({
                url: expanded,
                count: 12,
                cursor: 0,
                web: 1,
                hd: 1
            });

            // Hanya fokus menggunakan TIKWM
            const payload = await axios.post('https://www.tikwm.com/api/', form.toString(), {
                timeout: 45000,
                headers: {
                    'Accept': 'application/json, text/javascript, */*; q=0.01',
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                },
                validateStatus: () => true
            });

            let res = payload.data?.data;
            if (!res) return resolve({ status: false, msg: 'Gagal mendapatkan data dari Tikwm.' });

            if (res?.duration === 0) {
                // Tipe Gambar / Slide
                res.images.forEach(v => {
                    data.push({ type: 'photo', url: v });
                });
            } else {
                // Tipe Video
                data.push({
                    type: 'nowatermark',
                    url: res?.play ? (res.play.startsWith('http') ? res.play : 'https://www.tikwm.com' + res.play) : null
                });
            }

            let json = {
                status: true,
                title: res.title || 'Tanpa Judul',
                taken_at: formatDate(res.create_time),
                region: res.region,
                duration: res.duration + ' Seconds',
                data: data,
                music_info: {
                    title: res.music_info?.title || 'Original Audio',
                    author: res.music_info?.author || 'Tiktok',
                    url: res.music ? (res.music.startsWith('http') ? res.music : 'https://www.tikwm.com' + res.music) : res.music_info?.play
                },
                stats: {
                    views: formatNumber(res.play_count),
                    likes: formatNumber(res.digg_count),
                    comment: formatNumber(res.comment_count),
                    share: formatNumber(res.share_count)
                },
                author: {
                    nickname: res.author?.nickname || 'Unknown',
                }
            };
            resolve(json);
        } catch (e) {
            resolve({ status: false, msg: e.message });
        }
    });
}

module.exports = { tiktokDl };