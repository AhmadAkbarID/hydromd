const axios = require('axios');
const crypto = require("crypto");

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0";
const SECRET = "376136387538459893883312310911992847112448894410210511297108";
const TOTP_VERSION = 61;
const APP_VERSION = "1.2.92.50.g97692e81";
const FALLBACK_HASHES = [
    "eff59fa0a3d026b88b56fddbcf4bdfa16a186b8175a5c1a358c072e053c2e5b0",
    "21b3fe49546912ba782db5c47e9ef5a7dbd20329520ba0c7d0fcfadee671d24e"
];

const base = { referer: "https://open.spotify.com/", origin: "https://open.spotify.com", "user-agent": UA, "accept-language": "en" };
const session = { token: null, clientToken: null, expires: 0 };
let discoveredHash = null;

function totp(tsms) {
    const counter = Math.floor((tsms / 1000) / 30);
    const buf = Buffer.alloc(8);
    buf.writeBigInt64BE(BigInt(counter));
    const digest = crypto.createHmac("sha1", Buffer.from(SECRET, "utf8")).update(buf).digest();
    const offset = digest[digest.length - 1] & 0xf;
    return ((digest.readUInt32BE(offset) & 0x7fffffff) % 1000000).toString().padStart(6, "0");
}

async function getAuth(force) {
    if (!force && session.token && Date.now() < session.expires - 60000) return session;
    const now = Date.now();
    const params = new URLSearchParams({ reason: "init", productType: "web-player", totp: totp(now), totpServer: totp(now), totpVer: String(TOTP_VERSION) });
    
    const tokenRes = await fetch(`https://open.spotify.com/get_access_token?${params}`, { headers: base });
    const token = await tokenRes.json();
    if (!token?.accessToken) throw new Error("token request failed");
    
    const clientRes = await fetch("https://clienttoken.spotify.com/v1/clienttoken", {
        method: "POST",
        headers: { ...base, "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify({ client_data: { client_version: APP_VERSION, client_id: token.clientId, js_sdk_data: { device_brand: "unknown", device_model: "unknown", os: "windows", os_version: "NT 10.0", device_id: crypto.randomUUID(), device_type: "computer" } } })
    });
    const client = await clientRes.json();
    if (!client?.granted_token?.token) throw new Error("client token request failed");
    
    session.token = token.accessToken;
    session.clientToken = client.granted_token.token;
    session.expires = token.accessTokenExpirationTimestampMs || (now + 3000000);
    return session;
}

async function discoverHash() {
    if (discoveredHash !== null) return discoveredHash || null;
    discoveredHash = "";
    try {
        const htmlRes = await fetch("https://open.spotify.com/", { headers: { "user-agent": UA } });
        const html = await htmlRes.text();
        const mainUrl = (html.match(/https:\/\/open\.spotifycdn\.com\/cdn\/build\/web-player\/web-player\.[0-9a-f]+\.js/) || [])[0];
        if (!mainUrl) return null;
        const mainJsRes = await fetch(mainUrl, { headers: { "user-agent": UA, referer: "https://open.spotify.com/" } });
        const mainJs = await mainJsRes.text();
        const candidates = [...new Set([...mainJs.matchAll(/https:\/\/open\.spotifycdn\.com\/cdn\/build\/web-player\/[\w.\-]*search[\w.\-]*\.js/g)].map(x => x[0]))];
        for (const url of candidates) {
            const chunkJsRes = await fetch(url, { headers: { "user-agent": UA, referer: "https://open.spotify.com/" } });
            const chunkJs = await chunkJsRes.text();
            const hash = (chunkJs.match(/"searchDesktop","query","([a-f0-9]{64})"/) || [])[1];
            if (hash) { discoveredHash = hash; break; }
        }
    } catch {
        discoveredHash = "";
    }
    return discoveredHash || null;
}

function fmtDuration(ms) {
    const total = Math.floor((ms || 0) / 1000);
    return Math.floor(total / 60) + ":" + String(total % 60).padStart(2, "0");
}

function parseTrack(d) {
    if (!d) return null;
    const sources = d.albumOfTrack?.coverArt?.sources || [];
    const thumb = sources.reduce((a, b) => ((b.width || 0) > (a.width || 0) ? b : a), sources[0] || {}).url || null;
    const id = (d.uri || "").split(":")[2] || null;
    return {
        id,
        artist: (d.artists?.items || []).map(a => a.profile?.name).filter(Boolean).join(", "),
        title: d.name || null,
        duration: fmtDuration(d.duration?.totalMilliseconds || 0),
        thumb,
        url: id ? `https://open.spotify.com/track/${id}` : null
    };
}

async function runQuery(term, hash, limit, auth) {
    const params = new URLSearchParams({
        operationName: "searchDesktop",
        variables: JSON.stringify({ searchTerm: term, offset: 0, limit, numberOfTopResults: 1, includeAudiobooks: false }),
        extensions: JSON.stringify({ persistedQuery: { version: 1, sha256Hash: hash } })
    });
    const res = await fetch(`https://api-partner.spotify.com/pathdesktop/v1/query?${params}`, {
        headers: { ...base, accept: "application/json", "app-platform": "WebPlayer", authorization: `Bearer ${auth.token}`, "client-token": auth.clientToken, "spotify-app-version": APP_VERSION }
    });
    return res;
}

async function searchData(term, limit) {
    let auth = await getAuth(false);
    const tryHashes = async (hashes) => {
        for (const hash of hashes) {
            if (!hash) continue;
            let res = await runQuery(term, hash, limit, auth);
            if (res.status === 401) { auth = await getAuth(true); res = await runQuery(term, hash, limit, auth); }
            const json = await res.json().catch(() => null);
            if (json?.data?.searchV2) return json.data.searchV2;
        }
        return null;
    };
    const primary = discoveredHash ? [discoveredHash, ...FALLBACK_HASHES] : FALLBACK_HASHES;
    let data = await tryHashes(primary);
    if (!data) {
        const fresh = await discoverHash();
        if (fresh && !primary.includes(fresh)) data = await tryHashes([fresh]);
    }
    return data;
}

async function spotifyOfficial(searchTerm, limit = 20) {
    const term = String(searchTerm || "").trim();
    if (!term) return [];
    try {
        const data = await searchData(term, limit);
        if (!data) return [];
        const items = (data.tracksV2?.items || []).map(i => parseTrack(i.item?.data)).filter(Boolean).slice(0, limit);
        
        return items.map((t) => ({
            name: t.title || 'Tanpa Judul',
            artists: t.artist || 'Unknown',
            popularity: 'N/A',
            link: t.url || 'Tidak ada link',
            thumbnail: t.thumb || null,
            duration: t.duration || null
        }));
    } catch (e) {
        return [];
    }
}

async function searchSpotify(query) {
    try {
        try {
            let officialResults = await spotifyOfficial(query, 20);
            if (officialResults && officialResults.length > 0) {
                return officialResults;
            }
        } catch (err) {
            console.error("Official Spotify Scraper gagal, beralih ke Naze API:", err.message);
        }

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
        console.error(error.message);
        return [];
    }
}

module.exports = { searchSpotify };