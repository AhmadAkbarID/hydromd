const { modul } = require('../module');
const { fs } = modul;
const { color } = require('./color')
const axios = require('axios');
const path = require('path');

async function uncache(module = '.') {
  return new Promise((resolve, reject) => {
    try {
      delete require.cache[require.resolve(module)]
      resolve()
    } catch (e) {
      reject(e)
    }
  })
}

async function nocache(module, cb = () => { }) {
  console.log(color('Module', 'blue'), color(`'${module} is up to date!'`, 'cyan'))
  fs.watchFile(require.resolve(module), async () => {
    await uncache(require.resolve(module))
    cb(module)
  })
}

async function checkVersionUpdate() {
  try {
    const localPkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf-8'));
    const localVersion = localPkg.version;
    const url = 'https://raw.githubusercontent.com/AhmadAkbarID/hydro/refs/heads/master/package.json';
    const response = await axios.get(url);
    const remotePkg = response.data;
    const remoteVersion = remotePkg.version;

    if (remoteVersion !== localVersion) {
      console.log(color(`[INFO] Terdeteksi adanya update script: v${remoteVersion}.\nSilakan update di https://github.com/AhmadAkbarID/hydro`, 'yellow'));
    } else {
      console.log(color(`[INFO] Script telah menggunakan: v${localVersion} terbaru`, 'green'));
    }
  } catch (error) {
    console.error(color(`Gagal cek update: ${error.message}`, 'red'));
  }
}

module.exports = {
  uncache,
  nocache,
  checkVersionUpdate
}