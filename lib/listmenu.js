const chalk = require('chalk')
const fs = require('fs')

global.allmenu = (prefix) => {
return `✨━━━〔 🏞️ *𝐀𝐥𝐥 𝐌𝐞𝐧𝐮* 〕━━━✨

╭─〔 🔖 *𝐊𝐞𝐭𝐞𝐫𝐚𝐧𝐠𝐚𝐧 𝐀𝐤𝐬𝐞𝐬* 〕─╮
│ Ⓐ = ᴀᴅᴍɪɴ ɢʀᴜᴘ
│ Ⓞ = ᴘᴇᴍɪʟɪᴋ ʙᴏᴛ
│ Ⓛ = ʟɪᴍɪᴛ
│ Ⓕ = ғʀᴇᴇ / ɢʀᴀᴛɪs
╰──────────────────────╯

✨━━━〔 👑 *𝐎𝐰𝐧𝐞𝐫 𝐌𝐞𝐧𝐮* 〕━━━✨
➤ *${prefix}addowner* <reply/no> Ⓞ
➤ *${prefix}delowner* <reply/no> Ⓞ
➤ *${prefix}public* Ⓞ
➤ *${prefix}self* Ⓞ
➤ *${prefix}onlygc* <on/off> Ⓞ
➤ *${prefix}onlypc* <on/off> Ⓞ
➤ *${prefix}towl* <on/off> Ⓞ
➤ *${prefix}addwl* <link/id> Ⓞ
➤ *${prefix}delwl* <link/id> Ⓞ
➤ *${prefix}listwl* Ⓞ
➤ *${prefix}resetwl* Ⓞ
➤ *${prefix}join* <link> Ⓞ
➤ *${prefix}setprefix* <pref1|pref2> Ⓞ
➤ *${prefix}addsewa* <link> <durasi> Ⓞ
➤ *${prefix}delsewa* <id_grup> Ⓞ
➤ *${prefix}listsewa* Ⓞ
➤ *${prefix}creategc* <nama> Ⓞ
➤ *${prefix}addcase* <kode_js> Ⓞ
➤ *${prefix}caselimit* <nama_fitur> <jumlah> Ⓞ
➤ *<* Ⓞ
➤ *$* Ⓞ
➤ *vv* Ⓞ
➤ *>* Ⓞ
➤ *uu* Ⓞ

✨━━━〔 👥 *𝐆𝐫𝐨𝐮𝐩 𝐌𝐞𝐧𝐮* 〕━━━✨
➤ *${prefix}setprefixgc* <pref1|pref2> Ⓐ
➤ *${prefix}ceksewa* Ⓐ
➤ *${prefix}jadwalsholat* <prov, kota> Ⓐ
➤ *${prefix}promote* <reply/no> Ⓐ
➤ *${prefix}demote* <reply/no> Ⓐ
➤ *${prefix}kick* <reply/no> Ⓐ
➤ *${prefix}setnamegc* <nama_baru> Ⓐ
➤ *${prefix}setdescgc* <teks> Ⓐ
➤ *${prefix}setppgc* <reply_image> Ⓐ
➤ *${prefix}welcome* <on/off> Ⓐ
➤ *${prefix}left* <on/off> Ⓐ
➤ *${prefix}groupinfo* <on/off> Ⓐ
➤ *${prefix}antilinkall* <on/off> Ⓐ
➤ *${prefix}antilinkgc* <on/off> Ⓐ
➤ *${prefix}antilinkch* <on/off> Ⓐ
➤ *${prefix}antilinktt* <on/off> Ⓐ
➤ *${prefix}antilinkig* <on/off> Ⓐ
➤ *${prefix}antilinkyt* <on/off> Ⓐ
➤ *${prefix}antilinkfb* <on/off> Ⓐ
➤ *${prefix}antilinktw* <on/off> Ⓐ
➤ *${prefix}antiwame* <on/off> Ⓐ
➤ *${prefix}antitagsw* <on/off> Ⓐ
➤ *${prefix}antiswgc* <on/off> Ⓐ
➤ *${prefix}antitoxic* <on/off> Ⓐ
➤ *${prefix}setantilink* <type> Ⓐ
➤ *${prefix}deltoxic* <kata> Ⓐ
➤ *${prefix}addtoxic* <kata> Ⓐ
➤ *${prefix}listtoxic* Ⓐ

✨━━━〔 ⚙️ *𝐒𝐞𝐚𝐫𝐜𝐡 𝐌𝐞𝐧𝐮* 〕━━━✨
➤ *${prefix}pinterest* <judul> Ⓛ
➤ *${prefix}dafont* <nama_font> Ⓕ
➤ *${prefix}spotify* <judul> Ⓕ

✨━━━〔 ⚙️ *𝐔𝐭𝐢𝐥𝐢𝐭𝐲 𝐌𝐞𝐧𝐮* 〕━━━✨
➤ *${prefix}reactch* <link_post> <emoji> Ⓛ

✨━━━〔 📥 *𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝𝐞𝐫 𝐌𝐞𝐧𝐮* 〕━━━✨
➤ *${prefix}tiktok* <link> Ⓛ
➤ *${prefix}ttmusic* <link> Ⓛ
➤ *${prefix}instagram* <link> Ⓛ
➤ *${prefix}igaudio* <link> Ⓛ
➤ *${prefix}dafontdl* <link> Ⓛ
➤ *${prefix}ytmp3* <link> Ⓛ
➤ *${prefix}ytmp4* <link> <resolution> Ⓛ
➤ *${prefix}spotifydl* <link> Ⓛ
➤ *${prefix}gitclone* <link> Ⓕ

✨━━━〔 ⚒️ *𝐌𝐚𝐤𝐞𝐫 𝐌𝐞𝐧𝐮* 〕━━━✨
➤ *${prefix}brat* <teks> Ⓛ
➤ *${prefix}bratvid* <teks> Ⓛ
➤ *${prefix}iqc* <teks> Ⓛ
➤ *${prefix}balogo* <teks1|teks2> Ⓛ

✨━━━〔 🪄 *𝐂𝐨𝐧𝐯𝐞𝐫𝐭 𝐌𝐞𝐧𝐮* 〕━━━✨

➤ *${prefix}sticker* <reply/caption> Ⓛ
➤ *${prefix}toimg* <reply/caption> Ⓛ
➤ *${prefix}tovideo* <reply/caption> Ⓛ
➤ *${prefix}togif* <reply/caption> Ⓛ
➤ *${prefix}tomp3* <reply/caption> Ⓛ
➤ *${prefix}toaudio* <reply/caption> Ⓛ
➤ *${prefix}tovn* <reply/caption> Ⓛ
➤ *${prefix}tofile* <reply> Ⓛ

✨━━━〔 🤖 *𝐀𝐈 𝐌𝐞𝐧𝐮* 〕━━━✨

➤ *${prefix}mathgpt* <question/reply+question> Ⓛ
➤ *${prefix}feloai* <question> Ⓛ
➤ *${prefix}chatexai* <question> Ⓛ

✨━━━〔 ℹ️ *𝐎𝐭𝐡𝐞𝐫 𝐌𝐞𝐧𝐮* 〕━━━✨
➤ *${prefix}ping* Ⓕ
➤ *${prefix}rating* Ⓕ
➤ *${prefix}cekrating* Ⓕ
➤ *${prefix}script* Ⓕ
➤ *${prefix}script* Ⓕ

╭─〔 💡 *𝐓𝐢𝐩𝐬 𝐏𝐞𝐧𝐠𝐠𝐮𝐧𝐚𝐚𝐧* 〕─╮
│ Tanda kurung sudut "< >"
│ tidak perlu diketik ulang.
│ Contoh: *${prefix}onlygc on*
╰───────────────────╯`
}

global.ownermenu = (prefix) => {
return `✨━━━〔 👑 *𝐎𝐰𝐧𝐞𝐫 𝐌𝐞𝐧𝐮* 〕━━━✨

╭─〔 🔖 *𝐊𝐞𝐭𝐞𝐫𝐚𝐧𝐠𝐚𝐧 𝐀𝐤𝐬𝐞𝐬* 〕─╮
│ Ⓞ = ᴘᴇᴍɪʟɪᴋ ʙᴏᴛ
╰──────────────────────╯

➤ *${prefix}addowner* <reply/no> Ⓞ
➤ *${prefix}delowner* <reply/no> Ⓞ
➤ *${prefix}public* Ⓞ
➤ *${prefix}self* Ⓞ
➤ *${prefix}onlygc* <on/off> Ⓞ
➤ *${prefix}onlypc* <on/off> Ⓞ
➤ *${prefix}towl* <on/off> Ⓞ
➤ *${prefix}addwl* <link/id> Ⓞ
➤ *${prefix}delwl* <link/id> Ⓞ
➤ *${prefix}listwl* Ⓞ
➤ *${prefix}resetwl* Ⓞ
➤ *${prefix}join* <link> Ⓞ
➤ *${prefix}setprefix* <pref1|pref2> Ⓞ
➤ *${prefix}addsewa* <link> <durasi> Ⓞ
➤ *${prefix}delsewa* <id_grup> Ⓞ
➤ *${prefix}listsewa* Ⓞ
➤ *${prefix}creategc* <nama> Ⓞ
➤ *${prefix}addcase* <kode_js> Ⓞ
➤ *${prefix}caselimit* <nama_fitur> <jumlah> Ⓞ
➤ *<* Ⓞ
➤ *$* Ⓞ
➤ *vv* Ⓞ
➤ *>* Ⓞ
➤ *uu* Ⓞ` 
}

global.groupmenu = (prefix) => {
return `✨━━━〔 👥 *𝐆𝐫𝐨𝐮𝐩 𝐌𝐞𝐧𝐮* 〕━━━✨

╭─〔 🔖 *𝐊𝐞𝐭𝐞𝐫𝐚𝐧𝐠𝐚𝐧 𝐀𝐤𝐬𝐞𝐬* 〕─╮
│ Ⓐ = ᴀᴅᴍɪɴ ɢʀᴜᴘ
╰──────────────────────╯

➤ *${prefix}setprefixgc* <pref1|pref2> Ⓐ
➤ *${prefix}ceksewa* Ⓐ
➤ *${prefix}jadwalsholat* <provinsi, kota> Ⓐ
➤ *${prefix}promote* <reply/no> Ⓐ
➤ *${prefix}demote* <reply/no> Ⓐ
➤ *${prefix}kick* <reply/no> Ⓐ
➤ *${prefix}setnamegc* <nama_baru> Ⓐ
➤ *${prefix}setdescgc* <teks> Ⓐ
➤ *${prefix}setppgc* <reply_image> Ⓐ
➤ *${prefix}welcome* <on/off> Ⓐ
➤ *${prefix}left* <on/off> Ⓐ
➤ *${prefix}groupinfo* <on/off> Ⓐ
➤ *${prefix}antilinkall* <on/off> Ⓐ
➤ *${prefix}antilinkgc* <on/off> Ⓐ
➤ *${prefix}antilinkch* <on/off> Ⓐ
➤ *${prefix}antilinktt* <on/off> Ⓐ
➤ *${prefix}antilinkig* <on/off> Ⓐ
➤ *${prefix}antilinkyt* <on/off> Ⓐ
➤ *${prefix}antilinkfb* <on/off> Ⓐ
➤ *${prefix}antilinktw* <on/off> Ⓐ
➤ *${prefix}antiwame* <on/off> Ⓐ
➤ *${prefix}antitagsw* <on/off> Ⓐ
➤ *${prefix}antiswgc* <on/off> Ⓐ
➤ *${prefix}antitoxic* <on/off> Ⓐ
➤ *${prefix}setantilink* <type> Ⓐ
➤ *${prefix}deltoxic* <kata> Ⓐ
➤ *${prefix}addtoxic* <kata> Ⓐ
➤ *${prefix}listtoxic* Ⓐ`
}

global.downloadermenu = (prefix) => {
return `✨━━━〔 📥 *𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝𝐞𝐫 𝐌𝐞𝐧𝐮* 〕━━━✨

╭─〔 🔖 *𝐊𝐞𝐭𝐞𝐫𝐚𝐧𝐠𝐚𝐧 𝐀𝐤𝐬𝐞𝐬* 〕─╮
│ Ⓛ = ʟɪᴍɪᴛ
╰──────────────────────╯

➤ *${prefix}tiktok* <link> Ⓛ
➤ *${prefix}ttmusic* <link> Ⓛ
➤ *${prefix}instagram* <link> Ⓛ
➤ *${prefix}igaudio* <link> Ⓛ
➤ *${prefix}dafontdl* <link> Ⓛ
➤ *${prefix}ytmp3* <link> Ⓛ
➤ *${prefix}ytmp4* <link> <resolution> Ⓛ
➤ *${prefix}spotifydl* <link> Ⓛ
➤ *${prefix}gitclone* <link> Ⓕ`
}

global.searchmenu = (prefix) => {
return `✨━━━〔 ⚙️ *𝐒𝐞𝐚𝐫𝐜𝐡 𝐌𝐞𝐧𝐮* 〕━━━✨

╭─〔 🔖 *𝐊𝐞𝐭𝐞𝐫𝐚𝐧𝐠𝐚𝐧 𝐀𝐤𝐬𝐞𝐬* 〕─╮
│ Ⓛ = ʟɪᴍɪᴛ
│ Ⓕ = ғʀᴇᴇ / ɢʀᴀᴛɪs
╰──────────────────────╯

➤ *${prefix}pinterest* <judul> Ⓛ
➤ *${prefix}dafont* <nama_font> Ⓕ
➤ *${prefix}spotify* <judul> Ⓕ
➤ *${prefix}play* <judul> Ⓕ`
}

global.makermenu = (prefix) => {
return `✨━━━〔 ⚒️ *𝐌𝐚𝐤𝐞𝐫 𝐌𝐞𝐧𝐮* 〕━━━✨

╭─〔 🔖 *𝐊𝐞𝐭𝐞𝐫𝐚𝐧𝐠𝐚𝐧 𝐀𝐤𝐬𝐞𝐬* 〕─╮
│ Ⓛ = ʟɪᴍɪᴛ
╰──────────────────────╯

➤ *${prefix}brat* <teks> Ⓛ
➤ *${prefix}bratvid* <teks> Ⓛ
➤ *${prefix}iqc* <teks> Ⓛ
➤ *${prefix}qc* <teks> Ⓛ
➤ *${prefix}storyig* <teks> Ⓛ
➤ *${prefix}balogo* <teks1|teks2> Ⓛ`
}

global.convertmenu = (prefix) => {
return `✨━━━〔 🪄 *𝐂𝐨𝐧𝐯𝐞𝐫𝐭 𝐌𝐞𝐧𝐮* 〕━━━✨

╭─〔 🔖 *𝐊𝐞𝐭𝐞𝐫𝐚𝐧𝐠𝐚𝐧 𝐀𝐤𝐬𝐞𝐬* 〕─╮
│ Ⓛ = ʟɪᴍɪᴛ
╰──────────────────────╯

➤ *${prefix}sticker* <reply/caption> Ⓛ
➤ *${prefix}swm* <reply/caption> Ⓛ
➤ *${prefix}toimg* <reply/caption> Ⓛ
➤ *${prefix}tovideo* <reply/caption> Ⓛ
➤ *${prefix}togif* <reply/caption> Ⓛ
➤ *${prefix}tomp3* <reply/caption> Ⓛ
➤ *${prefix}toaudio* <reply/caption> Ⓛ
➤ *${prefix}tovn* <reply/caption> Ⓛ
➤ *${prefix}tofile* <reply> Ⓛ`
}

global.aimenu = (prefix) => {
return `✨━━━〔 🤖 *𝐀𝐈 𝐌𝐞𝐧𝐮* 〕━━━✨

╭─〔 🔖 *𝐊𝐞𝐭𝐞𝐫𝐚𝐧𝐠𝐚𝐧 𝐀𝐤𝐬𝐞𝐬* 〕─╮
│ Ⓛ = ʟɪᴍɪᴛ
╰──────────────────────╯

➤ *${prefix}mathgpt* <reply+question> Ⓛ
➤ *${prefix}feloai* <question> Ⓛ
➤ *${prefix}chatexai* <question> Ⓛ`
}

global.utilitymenu = (prefix) => {
return `✨━━━〔 ⚙️ *𝐔𝐭𝐢𝐥𝐢𝐭𝐲 𝐌𝐞𝐧𝐮* 〕━━━✨

╭─〔 🔖 *𝐊𝐞𝐭𝐞𝐫𝐚𝐧𝐠𝐚𝐧 𝐀𝐤𝐬𝐞𝐬* 〕─╮
│ Ⓛ = ʟɪᴍɪᴛ
╰──────────────────────╯

➤ *${prefix}reactch* <link_post> <emoji> Ⓛ`
}

global.othermenu = (prefix) => {
return `✨━━━〔 ℹ️ *𝐎𝐭𝐡𝐞𝐫 𝐌𝐞𝐧𝐮* 〕━━━✨

╭─〔 🔖 *𝐊𝐞𝐭𝐞𝐫𝐚𝐧𝐠𝐚𝐧 𝐀𝐤𝐬𝐞𝐬* 〕─╮
│ Ⓕ = ғʀᴇᴇ / ɢʀᴀᴛɪs
╰──────────────────────╯

➤ *${prefix}ping* Ⓕ
➤ *${prefix}rating* Ⓕ
➤ *${prefix}cekrating* Ⓕ
➤ *${prefix}script* Ⓕ
➤ *${prefix}script* Ⓕ`
}

let file = require.resolve(__filename)
fs.watchFile(file, () => {
	fs.unwatchFile(file)
	console.log(chalk.redBright(`Update ${__filename}`))
	delete require.cache[file]
	require(file)
})