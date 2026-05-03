const axios = require('axios');
const cheerio = require('cheerio');
const vm = require('node:vm');
const cloudscraper = require('cloudscraper');

async function indown(url) {
    try {
        const { data: pageData, headers } = await axios.get('https://indown.io/en1', {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/115.0.0.0 Safari/537.36' }
        });

        const $ = cheerio.load(pageData);
        const token = $('input[name="_token"]').val();
        const cookies = headers['set-cookie'] ? headers['set-cookie'].map(v => v.split(';')[0]).join('; ') : '';

        if (!token) throw new Error('Token Indown not found');

        const params = new URLSearchParams();
        params.append('referer', 'https://indown.io/en1');
        params.append('locale', 'en');
        params.append('_token', token);
        params.append('link', url);
        params.append('p', 'i');

        const { data: resultData } = await axios.post('https://indown.io/download', params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Cookie': cookies,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/115.0.0.0 Safari/537.36'
            }
        });

        const $result = cheerio.load(resultData);
        const resultUrls = [];

        $result('video source[src], a[href].btn-outline-primary').each((i, e) => {
            let link = $result(e).attr('src') || $result(e).attr('href');
            if (link) {
                if (link.includes('indown.io/fetch')) {
                    try { link = decodeURIComponent(new URL(link).searchParams.get('url')); } catch (err) {}
                }
                if (/cdninstagram\.com|fbcdn\.net/.test(link)) {
                    resultUrls.push(link.replace(/&dl=1$/, ''));
                }
            }
        });

        const uniqueUrls = [...new Set(resultUrls)];
        if (uniqueUrls.length === 0) throw new Error('No media found');

        return { status: true, source: 'indown', result: { metadata: { username: '-', caption: '-' }, downloadUrl: uniqueUrls } };
    } catch (e) {
        return { status: false, message: e.message };
    }
}

async function snapsave(targetUrl) {
    try {
        const form = new URLSearchParams();
        form.append('url', targetUrl);

        const { data } = await axios.post('https://snapsave.app/id/action.php?lang=id', form, {
            headers: {
                'origin': 'https://snapsave.app',
                'referer': 'https://snapsave.app/id/download-video-instagram',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        const ctx = { window: {}, document: { getElementById: () => ({ value: '' }) }, console: console, eval: (res) => res };
        vm.createContext(ctx);
        const decoded = vm.runInContext(data, ctx);
        const regex = /https:\/\/d\.rapidcdn\.app\/v2\?[^"]+/g;
        const matches = decoded.match(regex);

        if (matches && matches.length > 0) {
            const cleanUrls = [...new Set(matches.map(url => url.replace(/&amp;/g, '&')))];
            return { status: true, source: 'snapsave', result: { metadata: { username: '-', caption: '-' }, downloadUrl: cleanUrls } };
        }
        throw new Error('No media found');
    } catch (e) {
        return { status: false, message: e.message };
    }
}

const SNAP_BASE = 'https://snapinsta.to';
const snapHeaders = {
    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36',
    'Accept': '*/*',
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'X-Requested-With': 'XMLHttpRequest',
    'Origin': SNAP_BASE,
    'Referer': `${SNAP_BASE}/en2`,
};
const jar = new cloudscraper.jar();

async function snapinsta(instagramUrl) {
    try {
        const formData = `url=${encodeURIComponent(instagramUrl)}`;
        const tokenRes = await cloudscraper.post({
            uri: `${SNAP_BASE}/api/userverify`, headers: snapHeaders, body: formData, jar, simple: false, resolveWithFullResponse: true,
        });
        if (tokenRes.statusCode !== 200) throw new Error(`Token request failed`);
        const tokenData = JSON.parse(tokenRes.body);
        if (!tokenData.success) throw new Error('Token generation failed');
        const token = tokenData.token;

        const searchData = `q=${encodeURIComponent(instagramUrl)}&t=media&v=v2&lang=en&cftoken=${token}`;
        const searchRes = await cloudscraper.post({
            uri: `${SNAP_BASE}/api/ajaxSearch`, headers: snapHeaders, body: searchData, jar, simple: false, resolveWithFullResponse: true,
        });
        if (searchRes.statusCode !== 200) throw new Error(`Ajax request failed`);
        const searchJson = JSON.parse(searchRes.body);
        if (searchJson.status !== 'ok') throw new Error('Search failed');

        let capturedOutput = '';
        const sandbox = {
            console: { log: (...args) => { capturedOutput += args.join(' ') + '\n'; } },
            document: { write: (html) => { capturedOutput += html; }, writeln: (html) => { capturedOutput += html + '\n'; }, location: { hostname: 'snapinsta.to', href: 'https://snapinsta.to/en2' }, getElementById: () => ({ innerHTML: '' }), createElement: () => ({}), body: { appendChild: () => {} } },
            window: { location: { hostname: 'snapinsta.to', href: 'https://snapinsta.to/en2' }, document: { location: { hostname: 'snapinsta.to' } }, addEventListener: () => {}, removeEventListener: () => {} },
            location: { hostname: 'snapinsta.to' }, navigator: { userAgent: 'Mozilla/5.0' }, decodeURIComponent: (str) => decodeURIComponent(str), String: { fromCharCode: (...codes) => String.fromCharCode(...codes) },
            eval: function(code) { return vm.runInNewContext(code, sandbox); }
        };

        const resultVM = vm.runInNewContext(searchJson.data, sandbox);
        const finalHtml = capturedOutput || (typeof resultVM === 'string' ? resultVM : '');
        if (!finalHtml) throw new Error('No HTML output generated');

        const videoMatches = [...finalHtml.matchAll(/href="(https:\/\/dl\.snapcdn\.app\/get\?token=[^"]+)"/gi)].map(m => m[1]);
        const imageMatches = [...finalHtml.matchAll(/<img[^>]+src="(https:\/\/i\.snapcdn\.app\/photo\?token=[^"]+)"/gi)].map(m => m[1]);
        
        const urls = [...new Set([...videoMatches, ...imageMatches])];
        if (urls.length === 0) throw new Error('No media found');

        return { status: true, source: 'snapinsta', result: { metadata: { username: '-', caption: '-' }, downloadUrl: urls } };
    } catch (e) {
        return { status: false, message: e.message };
    }
}

async function igdl(url) {
    let res = await snapinsta(url);
    if (res.status && res.result && res.result.downloadUrl.length > 0) return res;

    res = await indown(url);
    if (res.status && res.result && res.result.downloadUrl.length > 0) return res;
    
    res = await snapsave(url);
    return res;
}

module.exports = { igdl, snapinsta, indown, snapsave };