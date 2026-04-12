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
➤ *${prefix}addcase* <kode> Ⓞ
➤ *${prefix}caselimit* <fitur> <jumlah> Ⓞ

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

✨━━━〔 📥 *𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝𝐞𝐫 𝐌𝐞𝐧𝐮* 〕━━━✨
➤ *${prefix}tiktok* <link> Ⓛ
➤ *${prefix}ttmusic* <link> Ⓛ

✨━━━〔 ℹ️ *𝐎𝐭𝐡𝐞𝐫 𝐌𝐞𝐧𝐮* 〕━━━✨
➤ *${prefix}ping* Ⓕ

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
➤ *${prefix}addcase* <kode_js> Ⓞ`
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
➤ *${prefix}groupinfo* <on/off> Ⓐ`
}

global.downloadermenu = (prefix) => {
return `✨━━━〔 📥 *𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝𝐞𝐫 𝐌𝐞𝐧𝐮* 〕━━━✨

╭─〔 🔖 *𝐊𝐞𝐭𝐞𝐫𝐚𝐧𝐠𝐚𝐧 𝐀𝐤𝐬𝐞𝐬* 〕─╮
│ Ⓛ = ʟɪᴍɪᴛ
╰──────────────────────╯

➤ *${prefix}tiktok* <link> Ⓛ
➤ *${prefix}ttmusic* <link> Ⓛ`
}

global.othermenu = (prefix) => {
return `✨━━━〔 ℹ️ *𝐎𝐭𝐡𝐞𝐫 𝐌𝐞𝐧𝐮* 〕━━━✨

╭─〔 🔖 *𝐊𝐞𝐭𝐞𝐫𝐚𝐧𝐠𝐚𝐧 𝐀𝐤𝐬𝐞𝐬* 〕─╮
│ Ⓕ = ғʀᴇᴇ / ɢʀᴀᴛɪs
╰──────────────────────╯

➤ *${prefix}ping* Ⓕ`
}

let file = require.resolve(__filename)
fs.watchFile(file, () => {
	fs.unwatchFile(file)
	console.log(chalk.redBright(`Update ${__filename}`))
	delete require.cache[file]
	require(file)
})