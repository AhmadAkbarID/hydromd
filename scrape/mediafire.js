const cheerio = require('cheerio');
const { basename, extname } = require('path');
const atob = require('atob');
const fetch = require('node-fetch');

async function mediafire(url) {
  try {
    const html = await fetch(url).then((r) => r.text());
    const $ = cheerio.load(html);

    const title = $("meta[property='og:title']").attr("content")?.trim() || "";
    const size = html.match(/Download\s+\((.*?)\)/)?.[1] || "Unknown";

    const $a = $("a.popsok").filter((_, el) => $(el).attr("href") === "javascript:void(0)").first();
    const b64 = $a.attr("data-scrambled-url");
    const dl = b64 ? atob(b64) : null;

    if (!dl) throw new Error("Download URL tidak ditemukan.");

    return {
      name: title,
      filename: basename(dl),
      type: extname(dl),
      size,
      download: dl,
      link: url,
    };
  } catch (e) {
    throw new Error("Gagal scrape: " + e.message);
  }
}

module.exports = mediafire;