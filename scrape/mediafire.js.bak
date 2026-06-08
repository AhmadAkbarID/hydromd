const cheerio = require('cheerio');
const { basename, extname } = require('path');
const atob = require('atob');

async function mediafire(url) {
  try {
    const html = await fetch(url).then((r) => r.text());
    const $ = cheerio.load(html);

    const title = $("meta[property='og:title']").attr("content")?.trim() || "";
    const size = html.match(/Download \\((.*?)\\)/)?.[1] || "Unknown";

    const $a = $("a.popsok")
      .filter((_, el) => $(el).attr("href") === "javascript:void(0)")
      .first();
    const b64 = $a.attr("data-scrambled-url");
    const dl = b64 ? atob(b64) : null;

    if (!dl) throw new Error("Missing download URL");

    return {
      name: title,
      filename: basename(dl),
      type: extname(dl),
      size,
      download: dl,
      link: url,
    };
  } catch (e) {
    throw new Error("Failed: " + e.message);
  }
}

module.exports = mediafire; // <- WAJIB untuk bisa dipanggil dari hydro.js