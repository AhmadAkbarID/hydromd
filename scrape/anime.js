const axios = require('axios');

// Base URL API
const baseURL = 'https://www.sankavollerei.com/anime';

// Helper function untuk fetch data
async function fetchJson(url) {
    try {
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        return data;
    } catch (error) {
        console.error(`Error fetching ${url}:`, error);
        return { status: 'error', message: error.message };
    }
}

/**
 * Mendapatkan data Home (Ongoing & Completed terbaru)
 */
async function animeHome() {
    return await fetchJson(`${baseURL}/home`);
}

/**
 * Mendapatkan Jadwal Anime
 */
async function animeSchedule() {
    return await fetchJson(`${baseURL}/schedule`);
}

/**
 * Mendapatkan Detail Anime berdasarkan Slug
 * @param {String} slug - contoh: "akamoto-day-part-2-sub-indo"
 */
async function animeDetail(slug) {
    if (!slug) return { status: 'error', message: 'Slug tidak boleh kosong' };
    return await fetchJson(`${baseURL}/anime/${slug}`);
}

/**
 * Mendapatkan list Anime Tamat (Completed)
 * @param {Number} page - Halaman ke berapa (default 1)
 */
async function animeCompleted(page = 1) {
    return await fetchJson(`${baseURL}/complete-anime?page=${page}`);
}

/**
 * Mendapatkan list Anime Sedang Tayang (Ongoing)
 * @param {Number} page - Halaman ke berapa (default 1)
 */
async function animeOngoing(page = 1) {
    return await fetchJson(`${baseURL}/ongoing-anime?page=${page}`);
}

/**
 * Mendapatkan Daftar Genre
 */
async function animeGenreList() {
    return await fetchJson(`${baseURL}/genre`);
}

/**
 * Mendapatkan Anime berdasarkan Genre
 * @param {String} slug - contoh: "action"
 * @param {Number} page - Halaman ke berapa (default 1)
 */
async function animeByGenre(slug, page = 1) {
    if (!slug) return { status: 'error', message: 'Slug genre tidak boleh kosong' };
    return await fetchJson(`${baseURL}/genre/${slug}?page=${page}`);
}

/**
 * Mencari Anime
 * @param {String} keyword - Kata kunci pencarian
 */
async function animeSearch(keyword) {
    if (!keyword) return { status: 'error', message: 'Keyword tidak boleh kosong' };
    return await fetchJson(`${baseURL}/search/${keyword}`);
}

/**
 * Mendapatkan Detail Episode & Link Download
 * @param {String} slug - contoh: "sd-p2-episode-10-sub-indo"
 */
async function animeEpisode(slug) {
    if (!slug) return { status: 'error', message: 'Slug episode tidak boleh kosong' };
    return await fetchJson(`${baseURL}/episode/${slug}`);
}

/**
 * Mendapatkan Link Download Batch
 * @param {String} slug - contoh: "jshk-s2-batch-sub-indo"
 */
async function animeBatch(slug) {
    if (!slug) return { status: 'error', message: 'Slug batch tidak boleh kosong' };
    return await fetchJson(`${baseURL}/batch/${slug}`);
}

module.exports = {
    animeHome,
    animeSchedule,
    animeDetail,
    animeCompleted,
    animeOngoing,
    animeGenreList,
    animeByGenre,
    animeSearch,
    animeEpisode,
    animeBatch
};