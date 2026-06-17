const axios = require('axios');
const readmore = String.fromCharCode(8206).repeat(4001);

module.exports.participantsUpdate = async (hydro, anu) => {
    try {
        if (!global.db.groups) global.db.groups = {};
        let gcSettings = global.db.groups[anu.id] || {};
        
        let isWelcome = (gcSettings.welcome !== undefined) ? gcSettings.welcome : global.welcome;
        let isLeft = (gcSettings.left !== undefined) ? gcSettings.left : global.left;

        if (anu.action === 'add' && !isWelcome) return;
        if (anu.action === 'remove' && !isLeft) return;

        let metadata = await hydro.groupMetadata(anu.id);
        let participants = anu.participants;
        let groupName = metadata.subject;
        let memberCount = metadata.participants.length;
        const fallbackImage = "https://raw.githubusercontent.com/AhmadAkbarID/media/main/weIcome.jpg";
        
        let actor = anu.author ? anu.author : '';
        let actorNum = actor ? actor.split('@')[0] : 'Sistem';
        
        for (let num of participants) {
            let userNum = num.split('@')[0];
            let pp_user;
            
            try {
                pp_user = await hydro.profilePictureUrl(num, 'image');
            } catch {
                pp_user = 'https://i.ibb.co/1s8T3sY/48f7ce63c7aa.jpg';
            }

            let pushName = "Hydro User";

            if (anu.action === 'add') {
                let welcomeBuffer;
                const welcomeUrl = `https://api.siputzx.my.id/api/canvas/welcomev5?username=${pushName}&guildName=${encodeURIComponent(groupName)}&memberCount=${memberCount}&avatar=${encodeURIComponent(pp_user)}&background=${encodeURIComponent(fallbackImage)}&quality=50`;

                try {
                    const { data } = await axios.get(welcomeUrl, { responseType: "arraybuffer" });
                    welcomeBuffer = data;
                } catch (e) {
                    const { data } = await axios.get(fallbackImage, { responseType: "arraybuffer" });
                    welcomeBuffer = data;
                }

                await hydro.sendMessage(anu.id, {
                    text: `ʜᴀɪ ᴋᴀᴋ @${userNum} sᴇʟᴀᴍᴀᴛ ʙᴇʀɢᴀʙᴜɴɢ ᴅɪ ${groupName}! 😝\n- ᴊɪᴋᴀ ɪɴɢɪɴ ɪɴᴛʀᴏ ᴋᴇᴛɪᴋ .ɪɴᴛʀᴏ\n- ᴘᴀᴛᴜʜɪ ᴀᴛᴜʀᴀɴ ɢʀᴜᴘ ᴊɪᴋᴀ ᴀᴅᴀ\n- ʙᴇʀsɪᴋᴀᴘ ʙᴀɪᴋ ᴅᴇɴɢᴀɴ sɪᴀᴘᴀᴘᴜɴ\n- ᴋᴀᴍᴜ sᴜᴅᴀʜ ʙᴇsᴀʀ ʙᴜᴋᴀɴ ᴀɴᴀᴋ ᴋᴇᴄɪʟ\nᴛᴇʀɪᴍᴀᴋᴀsɪʜ ᴅᴀʀɪ ᴘᴇᴍɪʟɪᴋ ʙᴏᴛ 🙏`,
                    contextInfo: {
                        mentionedJid: [num],
                        externalAdReply: {
                            title: `Welcome To ${groupName}`,
                            body: `Member ke-${memberCount}`,
                            thumbnail: welcomeBuffer,
                            sourceUrl: "https://store.hydrohost.web.id",
                            mediaType: 1,
                            renderLargerThumbnail: true
                        }
                    }
                });

            } else if (anu.action === 'remove') {
                let goodbyeBuffer;
                const goodbyeUrl = `https://api.siputzx.my.id/api/canvas/goodbyev2?username=${pushName}&guildName=${encodeURIComponent(groupName)}&memberCount=${memberCount}&avatar=${encodeURIComponent(pp_user)}&background=${encodeURIComponent(fallbackImage)}`;

                try {
                    const { data } = await axios.get(goodbyeUrl, { responseType: "arraybuffer" });
                    goodbyeBuffer = data;
                } catch (e) {
                    const { data } = await axios.get(fallbackImage, { responseType: "arraybuffer" });
                    goodbyeBuffer = data;
                }

                await hydro.sendMessage(anu.id, {
                    text: `🚪 ꜱᴀʏᴏɴᴀʀᴀ @${userNum}...\nᴊᴀɴɢᴀɴ ʟᴜᴘᴀɪɴ ᴋɪᴛᴀ ʏᴀ ᴅᴀʀɪ​ ${groupName}​.`,
                    contextInfo: {
                        mentionedJid: [num],
                        externalAdReply: {
                            title: `Sayonara From ${groupName}`,
                            body: `Member ke-${memberCount}`,
                            thumbnail: goodbyeBuffer,
                            sourceUrl: "https://store.hydrohost.web.id",
                            mediaType: 1,
                            renderLargerThumbnail: true
                        }
                    }
                });

            } else if (anu.action === 'promote') {
                await hydro.sendMessage(anu.id, {
                    text: `🥳 Selamat! @${userNum} telah dinaikkan menjadi *Admin* di grup ini oleh @${actorNum}.`,
                    contextInfo: { mentionedJid: actor ? [num, actor] : [num] }
                });
            } else if (anu.action === 'demote') {
                await hydro.sendMessage(anu.id, {
                    text: `📉 @${userNum} telah diturunkan menjadi *Member* oleh @${actorNum}.`,
                    contextInfo: { mentionedJid: actor ? [num, actor] : [num] }
                });
            }
        }
    } catch (err) {
        console.log(err);
    }
}

module.exports.groupsUpdate = async (hydro, anu, store) => {
    try {
        for (let i of anu) {
            let from = i.id;
            if (!global.db.groups) global.db.groups = {};
            let gcSettings = global.db.groups[from] || {};
            
            let isGroupInfo = (gcSettings.groupinfo !== undefined) ? gcSettings.groupinfo : global.groupinfo;
            if (!isGroupInfo) continue;

            let teks = '';
            
            let actor = i.author ? i.author : '';
            let actorNum = actor ? actor.split('@')[0] : 'Admin';
            let mentions = actor ? [actor] : [];
            
            let oldMeta = (store && store.groupMetadata && store.groupMetadata[from]) ? store.groupMetadata[from] : null;
            let oldSubject = oldMeta && oldMeta.subject ? oldMeta.subject : '';
            let oldDesc = oldMeta && oldMeta.desc ? oldMeta.desc.toString() : '';

            if (i.subject && i.subject !== oldSubject) {
                teks = `📝 *Perubahan Group*\n\n@${actorNum} Mengubah nama group\nBefore: ${oldSubject || 'Nama Sebelumnya'}\nAfter: ${i.subject}`;
            } else if (i.desc && i.desc.toString() !== oldDesc) {
                teks = `📝 *Perubahan Group*\n${readmore}\n@${actorNum} Mengubah Deskripsi\nBefore: ${oldDesc || 'Tidak ada deskripsi'}\nAfter: ${i.desc}`;
            } else if (i.icon) {
                teks = `🖼️ *Perubahan Group*\n\n@${actorNum} Mengubah foto profil grup.`;
            }

            if (teks) {
                await hydro.sendMessage(from, { 
                    text: teks,
                    contextInfo: { mentionedJid: mentions }
                });
            }
        }
    } catch (err) {
        console.log(err);
    }
}