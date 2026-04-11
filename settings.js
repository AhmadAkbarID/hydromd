const chalk = require("chalk")
const fs = require("fs")

// ======================== Default True/False ===================== \\

global.autosholat = true // true = aktif, false = mati, mengatur otomatis mengirim notif

// ======================== Setting Menu & Media ===================== \\

global.prefix = ['','!','.','#','&']
global.channel = '120363416755002041@newsletter' // GANTI DENGAN ID CHMU KALO ADA
global.channeln = 'HYDRO COMMUNITY 📢📦' // GANTI DENGAN NAMA CH MU
global.thumbnail = './media/menu.mp4' 
global.music = './media/menu.mp3'
/*
global.defaultpp = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png?q=60'

 COMING SOON

global.thum = global.thumbnail
global.log0 = global.thumbnail
global.err4r = global.thumbnail
global.thumb = global.thumbnail
*/
// ======================== Info Owner ===================== \\
global.ownername = 'FocaBars'
global.owner = ['6285187063723', '6288276554694']
global.ownernomer = '6285187063723'
global.ownernumber = '6285187063723'
global.ownerNumber = ["6285187063723@s.whatsapp.net"]
global.creator = "6285187063723@s.whatsapp.net"
global.ig = '@focabar'
global.tele = 'miminhydro'
global.ttowner = '@focabar'
global.socialm = 'GitHub: -'
global.location = 'Indonesia' 
global.ownerweb = "https://store.hydrohost.web.id" // Ganti 

// ======================== Info Bot ===================== \\
global.botname = "Asisten Hydro 🌊"
global.botnumber = '6283867608750'
global.wagc = "https://chat.whatsapp.com/FvSBEz1UezQ4G7Xwfrr9sF"
global.saluran = "https://whatsapp.com/channel/0029VbAYRBf4o7qSa74h2m0t"
global.themeemoji = '🏞️'
global.wm = "Asisten Hydro ||| WhatsApps Bots"
global.botscript = 'https://github.com/AhmadAkbarID/hydromd'
global.packname = "HYDRO"
global.author = "\n\n\n\n\nDibuat Oleh Asisten Hydro\nNo hape/wa : 6283867608750"
global.sessionName = 'furina'
global.hituet = 0

// ======================== API Keys ===================== \\
global.domain = 'https://panel.kamu.com'; // Domain Panel 
global.apikey = 'ptla_27Bkxxx'; // PLTA Panel
global.email = '@hydroarchon.xyz' // Domain email user
global.egg = '15'; // ID Egg
global.nestid = '5'; // ID Nest
global.loc = '1'; // ID Location
global.nodeid1 = [1]; // ID Node

// ======================== Respon Bot ===================== \\
global.mess = {
   wait: "*_Tunggu Sebentar.. Bot lagi berenang... 🏊_*",
   success: "Yay! Bot berhasil 🎉",
   on: "Yay! Nyala nih! 😝",
   off: "Ahh! Mati deh.. 😴",
   query: {
       text: "Teksnya mana? Aku kan gabisa baca pikiran kaka 😉",
       link: "Linknya dongg.. Aku gabisa tanpa link 😖",
       image: "Gambarnya mana nih? jahat banget engga ngasi:<",
   },
   error: {
       fitur: "Whoops! Eror nih.. laporkan ke owner agar diperbaiki 6285187063723 🙏",
   },
   only: {
       group: "Eh, Kak! Fitur ini bisanya buat grup nihh 🫂",
       private: "Eh, Kak! Fitur ini cuman bisa dipake chat pribadi! 🌚",
       owner: "Hanya untuk sang *Raja* 👑",
       admin: "Fitur ini cuman bisa dipake admin grup yah! 🥳",
       badmin: "Waduh! Aku butuh jadi admin agar bisa menggunakan fitur ini 🤯",
       premium: "Kak, ini fitur premium loh! Biar bisa jadi premium beli di 6285187063723 agar bisa menggunakan fitur ini 🤫",
   },
   replyimg: { // Ganti dengan gambar yang lain ya, sesuaikan dengan foto yang diinginkan
       tolak: "https://raw.githubusercontent.com/AhmadAkbarID/media/main/replytolak.png",
       query: "https://raw.githubusercontent.com/AhmadAkbarID/media/main/replyquery.png",
       success: "https://raw.githubusercontent.com/AhmadAkbarID/media/main/replysuccess.png",
       fail: "https://raw.githubusercontent.com/AhmadAkbarID/media/main/replyfail.png",
       wait: "https://raw.githubusercontent.com/AhmadAkbarID/media/main/replywait.png"
   }
}

// ======================== Auto Reload File ===================== \\
let file = require.resolve(__filename)
fs.watchFile(file, () => {
	fs.unwatchFile(file)
	console.log(chalk.redBright(`Update '${__filename}'`))
	delete require.cache[file]
	require(file)
})