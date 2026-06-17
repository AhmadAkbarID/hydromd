const fs = require('fs');

async function antilinkDetector(hydro, m, { budy, type, isAdmins, Ahmad, isBotAdmins, sender, senderNumber }) {
    if (!m.isGroup || !global.db.groups[m.chat]) return false;

    let gc = global.db.groups[m.chat];
    
    if (!gc.antilink) gc.antilink = { all: false, gc: false, ch: false, tt: false, ig: false, yt: false, fb: false, tw: false, wame: false, tagsw: false, swgc: false, toxic: false };
    if (!gc.antilinkAction) gc.antilinkAction = 'silent';
    if (!gc.antilinkWarnLimit) gc.antilinkWarnLimit = 3; 
    if (!gc.warns) gc.warns = {};

    const patterns = {
        all: /(https?:\/\/[^\s]+)/gi,
        gc: /(chat\.whatsapp\.com\/[A-Za-z0-9]+)/gi,
        ch: /(whatsapp\.com\/channel\/[A-Za-z0-9]+)/gi,
        tt: /(tiktok\.com|vt\.tiktok\.com)/gi,
        ig: /(instagram\.com)/gi,
        yt: /(youtube\.com|youtu\.be)/gi,
        fb: /(facebook\.com|fb\.com|fb\.watch|fb\.gg)/gi,
        tw: /(twitter\.com|x\.com)/gi,
        wame: /(wa\.me\/|api\.whatsapp\.com\/)/gi
    };

    let detectedType = null;
    let toxicWordMatched = "";
    
    for (let key in patterns) {
        if (gc.antilink[key] && patterns[key].test(budy)) {
            detectedType = key;
            break;
        }
    }

    if (!detectedType && gc.antilink.toxic) {
        if (fs.existsSync('./database/badword.json')) {
            let badwords = JSON.parse(fs.readFileSync('./database/badword.json'));
            if (badwords.length > 0) {
                let normalizedBudy = budy.toLowerCase().replace(/([a-z])\1+/gi, '$1');
                
                let escapedWords = badwords.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
                let toxicRegex = new RegExp('\\b(' + escapedWords.join('|') + ')\\b', 'i');
                
                let match = normalizedBudy.match(toxicRegex) || budy.match(toxicRegex);
                if (match) {
                    detectedType = 'toxic';
                    toxicWordMatched = match[0]; 
                }
            }
        }
    }

    if (!detectedType && gc.antilink.ch) {
        let isFromChannel = m.message?.[type]?.contextInfo?.forwardedNewsletterMessageInfo;
        let isReplyToChannel = m.quoted?.msg?.contextInfo?.forwardedNewsletterMessageInfo;

        if (isFromChannel || isReplyToChannel) {
            detectedType = 'ch'; 
        }
    }

    if (!detectedType) {
        if (gc.antilink.tagsw && type === 'groupStatusMentionMessage') {
            detectedType = 'tagsw';
        } else if (gc.antilink.swgc && type === 'groupStatusMessageV2') {
            detectedType = 'swgc';
        }
    }

    if (detectedType && !isAdmins && !Ahmad && isBotAdmins) {
        let action = gc.antilinkAction;

        try {
            await hydro.sendMessage(m.chat, { delete: m.key });
        } catch (err) {}
        
        if (action === 'silent') {
        } 
        
        else if (action === 'delete') {
            let msgTypeStr = detectedType === 'swgc' ? 'Status Grup' : 
                             detectedType === 'tagsw' ? 'Tag Status' : 
                             detectedType === 'ch' ? 'Link/Pesan Saluran' : 
                             detectedType === 'toxic' ? `Kata Kasar` : 'Link';
                             
            await hydro.sendMessage(m.chat, { 
                text: `⚠️ *Anti ${detectedType.toUpperCase()}*\n\n@${senderNumber} terdeteksi mengirim ${msgTypeStr} dan pesan telah dihapus.`, 
                mentions: [sender] 
            });
        } 
        
        else if (action === 'warn') {
            if (!gc.warns[sender]) gc.warns[sender] = 0;
            gc.warns[sender] += 1;
            
            if (gc.warns[sender] >= gc.antilinkWarnLimit) {
                await hydro.sendMessage(m.chat, { 
                    text: `🚫 *Batas Peringatan Tercapai*\n\n@${senderNumber} telah melanggar aturan sebanyak ${gc.antilinkWarnLimit}x`, 
                    mentions: [sender] 
                });
                await hydro.groupParticipantsUpdate(m.chat, [sender], 'remove');
                gc.warns[sender] = 0; 
            } else {
                let msgActionStr = detectedType === 'tagsw' ? 'melakukan mentions status ke group' : 
                                   detectedType === 'swgc' ? 'membuat status group' : 
                                   detectedType === 'ch' ? 'mengirim link atau meneruskan pesan dari Saluran' : 
                                   detectedType === 'toxic' ? `menggunakan kata kasar` : 'mengirim link di grup';
                
                await hydro.sendMessage(m.chat, { 
                    text: `⚠️ *Peringatan Anti ${detectedType.toUpperCase()}*\n\n@${senderNumber} Dilarang ${msgActionStr}!\n\nPeringatan ke *${gc.warns[sender]}/${gc.antilinkWarnLimit}*\nMohon patuhi aturan dan jika sudah melebihi batas kamu akan dikeluarkan!`, 
                    mentions: [sender] 
                });
            }
        } 
        
        else if (action === 'kick') {
            await hydro.sendMessage(m.chat, { 
                text: `🚫 *Anti ${detectedType.toUpperCase()}*\n\n@${senderNumber} melanggar aturan dan langsung dikeluarkan oleh sistem.`, 
                mentions: [sender] 
            });
            await hydro.groupParticipantsUpdate(m.chat, [sender], 'remove');
        }
        
        fs.writeFileSync('./database/database.json', JSON.stringify(global.db, null, 2));
        return true; 
    }
    return false;
}

module.exports = { antilinkDetector };