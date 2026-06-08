const puppeteer = require("puppeteer");

const axios = require("axios");

async function scrapeOtakufiles(url) {

  const browser = await puppeteer.launch({

    headless: true,

    args: ["--no-sandbox", "--disable-setuid-sandbox"]

  });

  const page = await browser.newPage();

  try {

    await page.goto(url, { waitUntil: "networkidle2" });

    const code = await page.$eval("form span", el => el.textContent.trim());

    await page.type("input[name='code']", code);

    await Promise.all([

      page.click("button[type='submit']"),

      page.waitForNavigation({ waitUntil: "networkidle2" })

    ]);

    const downloadLink = await page.$eval("a.btn.btn-dow", el => el.href);

    const fileName = downloadLink.split("/").pop().split("?")[0];

    // Cek ukuran file

    const head = await axios.head(downloadLink);

    const fileSize = head.headers['content-length'];

    await browser.close();

    return {

      status: true,

      link: downloadLink,

      fileName,

      fileSize: formatSize(fileSize)

    };

  } catch (err) {

    await browser.close();

    return { status: false, error: err.message };

  }

}

function formatSize(bytes) {

  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  if (!bytes || bytes === 0) return '0 Bytes';

  const i = Math.floor(Math.log(bytes) / Math.log(1024));

  return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];

}

module.exports = scrapeOtakufiles;