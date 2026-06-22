const axios = require("axios")
const cheerio = require("cheerio")
const { formatFileSize, parseFileSize } = require("../../utils/filesize")
const { author } = require("../../config")
const { formatViews } = require("../../utils/views")


async function gdrive(url) {
  if (!(url && url.match(/drive\.google/i))) throw 'Invalid URL';
  
  let id = (url.match(/\/?id=(.+)/i) || url.match(/\/d\/(.*?)\//))[1];
  if (!id) throw 'ID Not Found';

  let res = await fetch(`https://drive.google.com/uc?id=${id}&authuser=0&export=download`, {
    method: 'post',
    headers: {
      'accept-encoding': 'gzip, deflate, br',
      'content-length': 0,
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      'origin': 'https://drive.google.com',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36',
      'x-client-data': 'CKG1yQEIkbbJAQiitskBCMS2yQEIqZ3KAQioo8oBGLeYygE=',
      'x-drive-first-party': 'DriveWebUi',
      'x-json-requested': 'true'
    }
  });

  let { fileName, sizeBytes, downloadUrl } = JSON.parse((await res.text()).slice(4));
  if (!downloadUrl) throw 'Límite de descarga del link';

  let data = await fetch(downloadUrl);
  if (data.status !== 200) throw data.statusText;

  let fileSize = formatFileSize(sizeBytes);
  let fileSizeB = parseFileSize(fileSize);
  let mimetype = data.headers.get('content-type');

  return { 
    downloadUrl, 
    fileName, 
    fileSize,
    fileSizeB, 
    mimetype
  };
}

module.exports = { gdrive }