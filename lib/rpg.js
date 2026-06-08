const fs = require('fs')

const toSmallCaps = (text) => {
    const smallCapsMap = {
        a: 'ᴀ', b: 'ʙ', c: 'ᴄ', d: 'ᴅ', e: 'ᴇ', f: 'ғ', g: 'ɢ', h: 'ʜ', i: 'ɪ', j: 'ᴊ',
        k: 'ᴋ', l: 'ʟ', m: 'ᴍ', n: 'ɴ', o: 'ᴏ', p: 'ᴘ', q: 'ǫ', r: 'ʀ', s: 's', t: 'ᴛ',
        u: 'ᴜ', v: 'ᴠ', w: 'ᴡ', x: 'x', y: 'ʏ', z: 'ᴢ'
    };
    return text.toLowerCase().split('').map(c => smallCapsMap[c] || c).join('');
};

// ─── TIER SYSTEM ─────────────────────────────────────────────────────────────
const roleFromLevel = (level) => {
    if (level <= 10)  return 'Novice 🔰';
    if (level <= 20)  return 'Fighter ⚔️';
    if (level <= 30)  return 'Warrior 🗡️';
    if (level <= 40)  return 'Elite Warrior 🛡️';
    if (level <= 50)  return 'Master 🔱';
    if (level <= 80)  return 'Grandmaster 🏵️';
    if (level <= 100) return 'Legend 👑';
    return 'Mythic 🐉';
};

const emoticon = (item) => {
    const emots = {
        chip: '🪙', money: '💵', bank: '🏦', level: '📊', diamond: '💎', gold: '🥇',
        health: '❤️', wood: '🪵', rock: '🪨', string: '🕸️', iron: '⛓️', potion: '🥤',
        trash: '🗑️', emerald: '❇️', umpan: '🪱', upgrader: '🧰', pet: '🐾', petfood: '🍖',
        sword: '🗡️', pickaxe: '⛏️', fishingrod: '🎣', armor: '🦺',
        bibitanggur: '🍇', bibitmangga: '🥭', bibitpisang: '🍌', bibitapel: '🍎', bibitjeruk: '🍊',
        anggur: '🍇', mangga: '🥭', pisang: '🍌', apel: '🍎', jeruk: '🍊',
        horse: '🐎', cat: '🐈', fox: '🦊', dog: '🐕', robo: '🤖'
    };
    return emots[item] || '📦';
};

// ─── EXP SYSTEM ──────────────────────────────────────────────────────────────
const expToNextLevel = (level) => 100 + (level * 50)

const addExp = (user, expGained) => {
    if (typeof user.level !== 'number') user.level = 0
    if (typeof user.exp   !== 'number') user.exp   = 0

    const oldLevel = user.level
    const oldRole  = roleFromLevel(oldLevel)

    user.exp += expGained

    let levelUps = 0
    while (user.exp >= expToNextLevel(user.level)) {
        user.exp   -= expToNextLevel(user.level)
        user.level += 1
        levelUps   += 1
    }

    const newLevel = user.level
    const newRole  = roleFromLevel(newLevel)
    const tierChanged = oldRole !== newRole

    return { levelUps, oldLevel, newLevel, tierChanged, oldRole, newRole, expGained }
};

// ─── DAILY BONUS ─────────────────────────────────────────────────────────────
// PENTING: lastDaily & dailyStreak HARUS disimpan ke database.json agar persist
// setelah bot restart!
const gameDaily = async (conn, m, prefix, db) => {
    try {
        if (!db.users[m.sender]) return m.reply('❌ Data kamu tidak ditemukan.')

        // Cek apakah user sudah daftar (jika mode on)
        const user = db.users[m.sender]
        if (global.db.settings?.registrationRequired === true && user.registered !== true) {
            return m.reply(
                `❌ Kamu belum mendaftar!\n\n` +
                `Ketik *.daftar nama umur* untuk mendaftar\n\n` +
                `Contoh: *.daftar Budi 25*`
            )
        }

        const now       = Date.now()
        const COOLDOWN  = 24 * 60 * 60 * 1000
        const lastDaily = user.lastDaily || 0

        // ── Cek cooldown ──
        if (now - lastDaily < COOLDOWN) {
            const sisaMs  = COOLDOWN - (now - lastDaily)
            const sisaJam = Math.floor(sisaMs / (1000 * 60 * 60))
            const sisaMnt = Math.floor((sisaMs % (1000 * 60 * 60)) / (1000 * 60))
            const sisaDtk = Math.floor((sisaMs % (1000 * 60)) / 1000)
            return m.reply(
                `⏰ *Kamu sudah klaim daily hari ini!*\n\n` +
                `⌛ Kembali dalam: *${sisaJam} jam ${sisaMnt} menit ${sisaDtk} detik*\n\n` +
                `📌 Klaim setiap hari untuk menjaga streak! 🔥`
            )
        }

        // ── Hitung streak ──
        const STREAK_WINDOW = 48 * 60 * 60 * 1000
        if (!user.dailyStreak) user.dailyStreak = 0

        if (lastDaily > 0 && (now - lastDaily) <= STREAK_WINDOW) {
            user.dailyStreak = Math.min(user.dailyStreak + 1, 7)
        } else {
            user.dailyStreak = 1
        }

        const streak = user.dailyStreak

        // ── Hitung reward ──
        const baseBonus   = Math.floor(Math.random() * 3001) + 2000  // 2.000–5.000 koin
        const streakBonus = (streak - 1) * 500                        // +500 per hari streak
        const limitBonus  = 5                                          // +5 limit
        const totalMoney  = baseBonus + streakBonus

        // EXP: 20 base + 5 per streak (maks 50 di streak 7)
        const expReward = 20 + (streak - 1) * 5

        // ── Simpan uang & limit ──
        user.money     = (user.money || 0) + totalMoney
        user.limitfree = (user.limitfree || 0) + limitBonus
        user.lastDaily = now  // PENTING: timestamp di-set di sini
        user.dailyStreak = streak  // PENTING: streak di-set di sini

        // ── Tambah exp & proses level up ──
        const lvlResult = addExp(user, expReward)

        // ── SAVE KE DATABASE.JSON SETIAP KALI DAILY DIKLAIM ──
        try {
            require('fs').writeFileSync('./database/database.json', JSON.stringify(db, null, 2))
        } catch (e) {
            console.error('[gameDaily] Save DB error:', e)
        }

        // ── Bangun pesan ──
        const streakBar  = '🔥'.repeat(streak) + '⬜'.repeat(7 - streak)
        const expBarFull = 10
        const expNeed    = expToNextLevel(user.level)
        const expFilled  = Math.round((user.exp / expNeed) * expBarFull)
        const expBar     = '█'.repeat(expFilled) + '░'.repeat(expBarFull - expFilled)

        let levelUpText = ''
        if (lvlResult.levelUps > 0) {
            levelUpText = `\n🎊 *LEVEL UP!* ${lvlResult.oldLevel} → *${lvlResult.newLevel}*\n`
            if (lvlResult.tierChanged) {
                levelUpText += `🏅 *TIER NAIK!* ${lvlResult.oldRole} → *${lvlResult.newRole}*\n`
            }
        }

        return m.reply(
            `🎁 *────── DAILY BONUS ──────* 🎁\n\n` +
            `👤 *${m.pushName || 'User'}*\n` +
            `🏅 *${roleFromLevel(user.level)}*  •  Lv.${user.level}\n\n` +
            `💵 *Bonus Dasar :* +${baseBonus.toLocaleString('id-ID')} koin\n` +
            `🔥 *Streak Bonus:* +${streakBonus.toLocaleString('id-ID')} koin\n` +
            `⚡ *Limit       :* +${limitBonus} limit\n` +
            `✨ *EXP         :* +${expReward} exp\n` +
            `━━━━━━━━━━━━━━━━━\n` +
            `🎁 *Total Koin  :* +${totalMoney.toLocaleString('id-ID')}\n` +
            `${levelUpText}\n` +
            `🔥 *Streak ${streak}/7*  ${streakBar}\n\n` +
            `📊 *EXP:* ${user.exp}/${expNeed}\n` +
            `[${expBar}]\n\n` +
            `💰 *Saldo:* ${user.money.toLocaleString('id-ID')} koin\n` +
            `🎁 *──────────────────────────* 🎁`
        )

    } catch (e) {
        console.error('[gameDaily]', e)
        return m.reply('❌ Terjadi error saat klaim daily!')
    }
}

module.exports = {
    toSmallCaps,
    roleFromLevel,
    emoticon,
    expToNextLevel,
    addExp,
    gameDaily
};