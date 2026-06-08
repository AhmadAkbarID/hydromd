const fs = require('fs');
const axios = require('axios');
const { getRandom, smsg, isUrl, generateMessageTag, getBuffer, getSizeMedia, fetchJson, delay, sleep } = require('./myfunc');
const { isSetWelcome, getTextSetWelcome } = require('./setwelcome');
const { isSetLeft, getTextSetLeft } = require('./setleft');
const moment = require('moment-timezone');
const { proto, jidDecode, jidNormalizedUser, generateForwardMessageContent, generateWAMessageFromContent, downloadContentFromMessage } = require('socketon');

const loadJsonSafe = (path, fallback) => {
  try {
    return JSON.parse(fs.readFileSync(path));
  } catch (e) {
    return fallback;
  }
};

let set_welcome_db = loadJsonSafe('./database/set_welcome.json', []);
let set_left_db    = loadJsonSafe('./database/set_left.json', []);
let setting        = loadJsonSafe('./config.json', {});


fs.watchFile('./database/set_welcome.json', { interval: 1000 }, () => {
  set_welcome_db = loadJsonSafe('./database/set_welcome.json', []);
});

fs.watchFile('./database/set_left.json', { interval: 1000 }, () => {
  set_left_db = loadJsonSafe('./database/set_left.json', []);
});

fs.watchFile('./config.json', { interval: 1000 }, () => {
  setting = loadJsonSafe('./config.json', {});
});

module.exports.welcome = async (iswel, isleft, hydro, anu) => {
  try {
    const metadata = await hydro.groupMetadata(anu.id);
    const participants = anu.participants;
    const groupName = metadata.subject;
    const memberCount = metadata.participants.length;
    const groupDesc = metadata.desc || "-";
    const fallbackImage = "https://raw.githubusercontent.com/AhmadAkbarID/media/main/weIcome.jpg";

    for (let num of participants) {
      let pp_user;
      try {
        pp_user = await hydro.profilePictureUrl(jidNormalizedUser(num), 'image');
      } catch {
        pp_user = 'https://i.ibb.co/1s8T3sY/48f7ce63c7aa.jpg';
      }

      const pushName = "Hydro User"

      if (anu.action === 'add' && (iswel || setting.auto_welcomeMsg)) {
        if (isSetWelcome(anu.id, set_welcome_db)) {
          const get_teks = await getTextSetWelcome(anu.id, set_welcome_db);
          const replaced = get_teks
            .replace(/@user/gi, `.@${num.split('@')[0]}`)
            .replace(/@group/gi, groupName)
            .replace(/@desc/gi, groupDesc);

          await hydro.sendMessage(anu.id, { text: replaced, mentions: [num] });
        } else {
          let welcomeBuffer;
          const welcomeUrl = `https://api.siputzx.my.id/api/canvas/welcomev5?` +
            `username=${pushName}` +
            `&guildName=${encodeURIComponent(groupName)}` +
            `&memberCount=${memberCount}` +
            `&avatar=${encodeURIComponent(pp_user)}` +
            `&background=${encodeURIComponent('https://raw.githubusercontent.com/AhmadAkbarID/media/main/weIcome.jpg')}` +
            `&quality=50`;

          try {
            const { data } = await axios.get(welcomeUrl, { responseType: "arraybuffer" });
            welcomeBuffer = data;
          } catch (e) {
            const { data } = await axios.get(fallbackImage, { responseType: "arraybuffer" });
            welcomeBuffer = data;
          }

          await hydro.sendMessage(anu.id, {
            text: `ʜᴀɪ ᴋᴀᴋ @${num.split("@")[0]} sᴇʟᴀᴍᴀᴛ ʙᴇʀɢᴀʙᴜɴɢ ᴅɪ ${groupName}! 😝\n- ᴊɪᴋᴀ ɪɴɢɪɴ ɪɴᴛʀᴏ ᴋᴇᴛɪᴋ .ɪɴᴛʀᴏ\n- ᴘᴀᴛᴜʜɪ ᴀᴛᴜʀᴀɴ ɢʀᴜᴘ ᴊɪᴋᴀ ᴀᴅᴀ\n- ʙᴇʀsɪᴋᴀᴘ ʙᴀɪᴋ ᴅᴇɴɢᴀɴ sɪᴀᴘᴀᴘᴜɴ\n- ᴋᴀᴍᴜ sᴜᴅᴀʜ ʙᴇsᴀʀ ʙᴜᴋᴀɴ ᴀɴᴀᴋ ᴋᴇᴄɪʟ\nᴛᴇʀɪᴍᴀᴋᴀsɪʜ ᴅᴀʀɪ ᴘᴇᴍɪʟɪᴋ ʙᴏᴛ 🙏`,
            contextInfo: {
              mentionedJid: [num],
              externalAdReply: {
                title: `Welcome ${pushName}`,
                body: `Member ke-${memberCount}`,
                thumbnail: welcomeBuffer,
                sourceUrl: "https://store.hydrohost.web.id",
                mediaType: 1,
                renderLargerThumbnail: true
              }
            }
          });
        }
      } else if (anu.action === 'remove' && (isleft || setting.auto_leaveMsg)) {
        if (isSetLeft(anu.id, set_left_db)) {
          const get_teks = await getTextSetLeft(anu.id, set_left_db);
          const replaced = get_teks
            .replace(/@user/gi, `.@${num.split('@')[0]}`)
            .replace(/@group/gi, groupName)
            .replace(/@desc/gi, groupDesc);

          await hydro.sendMessage(anu.id, {
            image: { url: pp_user },
            caption: replaced,
            mentions: [num]
          });
        } else {
          let goodbyeBuffer;
          const goodbyeUrl = `https://api.siputzx.my.id/api/canvas/goodbyev2?` +
            `username=${pushName}` +
            `&guildName=${encodeURIComponent(groupName)}` +
            `&memberCount=${memberCount}` +
            `&avatar=${encodeURIComponent(pp_user)}` +
            `&background=${encodeURIComponent('https://raw.githubusercontent.com/AhmadAkbarID/media/main/weIcome.jpg')}`;

          try {
            const { data } = await axios.get(goodbyeUrl, { responseType: "arraybuffer" });
            goodbyeBuffer = data;
          } catch (e) {
            const { data } = await axios.get(fallbackImage, { responseType: "arraybuffer" });
            goodbyeBuffer = data;
          }

          await hydro.sendMessage(anu.id, {
            text: `ʙᴀɪʙᴀɪ ᴋᴀᴋ @${num.split("@")[0]} sᴇᴍᴏɢᴀ ᴛᴇɴᴀɴɢ ᴅɪ ᴀʟᴀᴍ sᴀɴᴀ`,
            contextInfo: {
              mentionedJid: [num],
              externalAdReply: {
                title: `Sayonara ${pushName}`,
                body: `Member ke-${memberCount}`,
                thumbnail: goodbyeBuffer,
                sourceUrl: "https://store.hydrohost.web.id",
                mediaType: 1,
                renderLargerThumbnail: true
              }
            }
          });
        }
      } else if (anu.action === 'promote') {
        hydro.sendMessage(anu.id, {
          text: `ʜᴇʏ ᴋᴀᴍᴜ! @${num.split('@')[0]}\nᴘᴀɴɢᴋᴀᴛ ᴋᴀᴍᴜ ᴅɪ ɢʀᴜᴘ ${groupName} ɴᴀɪᴋ ᴍᴇɴᴊᴀᴅɪ ᴀᴅᴍɪɴ 🤪`,
          mentions: [num],
        });
      } else if (anu.action === 'demote') {
        hydro.sendMessage(anu.id, {
          text: `ʜᴇʏ ᴋᴀᴍᴜ! @${num.split('@')[0]}\nᴘᴀɴɢᴋᴀᴛ ᴋᴀᴍᴜ ᴅɪ ɢʀᴜᴘ ${groupName} ᴛᴜʀᴜɴ ᴍᴇɴᴊᴀᴅɪ ᴀɴɢɢᴏᴛᴀ 👀`,
          mentions: [num],
        });
      }
    }

  } catch (err) {
    console.error(err);
  }
};