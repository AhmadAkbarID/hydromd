const axios = require('axios');

async function tiktokDl(url) {
    return new Promise(async (resolve, reject) => {
        try {
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

            function formatTikwmResponse(res) {
                let data = [];
                if (res?.duration === 0 && res.images) {
                    res.images.forEach(v => {
                        data.push({ type: 'photo', url: v });
                    });
                } else {
                    let vidUrl = res.hdplay || res.play;
                    data.push({
                        type: 'nowatermark',
                        url: vidUrl ? (vidUrl.startsWith('http') ? vidUrl : 'https://www.tikwm.com' + vidUrl) : null
                    });
                }

                let musicPlayUrl = res.music_info?.play || res.music || '';
                if (musicPlayUrl && !musicPlayUrl.startsWith('http')) {
                    musicPlayUrl = 'https://www.tikwm.com' + musicPlayUrl;
                }

                return {
                    status: true,
                    title: res.title || 'Tanpa Judul',
                    taken_at: formatDate(res.create_time),
                    region: res.region,
                    duration: res.duration + ' Seconds',
                    data: data,
                    music_info: {
                        title: res.music_info?.title || 'Original Audio',
                        author: res.music_info?.author || 'Tiktok',
                        url: musicPlayUrl || null,
                        cover: res.music_info?.cover || res.cover || null // <-- Penambahan untuk cover musik
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
            }

            let v1Success = false;
            try {
                const form = new URLSearchParams({
                    url: url,
                    count: 12,
                    cursor: 0,
                    web: 1,
                    hd: 1
                });

                const payloadV1 = await axios.post('https://www.tikwm.com/api/', form.toString(), {
                    timeout: 25000,
                    headers: {
                        'Accept': 'application/json, text/javascript, */*; q=0.01',
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    },
                    validateStatus: () => true
                });

                if (payloadV1.data?.code === 0 && payloadV1.data?.data) {
                    v1Success = true;
                    return resolve(formatTikwmResponse(payloadV1.data.data));
                }
            } catch (e) {}

            if (!v1Success) {
                let keys = [];
                if (typeof global.tikwmkey !== 'undefined' && global.tikwmkey) {
                    if (Array.isArray(global.tikwmkey)) {
                        keys = global.tikwmkey;
                    } else if (typeof global.tikwmkey === 'string') {
                        keys = global.tikwmkey.split(',').map(k => k.trim()).filter(k => k !== '');
                    }
                }

                if (keys.length === 0) {
                    return resolve({ status: false, msg: 'API Publik sedang Limit & API Key belum dipasang di settings.js' });
                }

                for (let i = 0; i < keys.length; i++) {
                    try {
                        const currentKey = keys[i];
                        const payloadV2 = await axios.get('https://api.tikwmapi.com/', {
                            params: {
                                url: url, 
                                hd: 1
                            },
                            headers: {
                                'x-tikwmapi-key': currentKey
                            },
                            timeout: 25000,
                            validateStatus: () => true
                        });

                        if (payloadV2.data?.code === 0 && payloadV2.data?.data) {
                            return resolve(formatTikwmResponse(payloadV2.data.data));
                        }
                    } catch (e) {
                        continue;
                    }
                }
                return resolve({ status: false, msg: 'Semua API Key TikWM kamu telah mencapai limit atau mati!' });
            }

        } catch (e) {
            return resolve({ status: false, msg: String(e) });
        }
    });
}

module.exports = { tiktokDl };