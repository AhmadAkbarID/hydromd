/*
 * ╔═══════════════════════════════════════╗
 * ║         HYDROBOT - GAMES.JS           ║
 * ║         Casino Solo Feature           ║
 * ╚═══════════════════════════════════════╝
 */

const { addExp, expToNextLevel, roleFromLevel } = require('./rpg')

// ─── CASINO SOLO ─────────────────────────────────────────────────────────────
const gameCasinoSolo = async (conn, m, prefix, db, args) => {
    try {
        if (!db.users[m.sender]) return m.reply('❌ Data kamu tidak ditemukan.')

        const user = db.users[m.sender]

        // ── Cek registrasi jika mode registration ON ──
        if (global.db.settings?.registrationRequired === true && user.registered !== true) {
            return m.reply(
                `❌ Kamu belum mendaftar!\n\n` +
                `Ketik *.daftar nama umur* untuk mendaftar\n\n` +
                `Contoh: *.daftar Budi 25*`
            )
        }

        // Cek limit — pakai limitfree + limitprem + limitbuy
        const totalLimit = (user.limitfree || 0) + (user.limitprem || 0) + (user.limitbuy || 0)
        if (totalLimit < 1) return m.reply(global.mess?.limit || '❌ Limit kamu habis!')

        const botNumber = await conn.decodeJid(conn.user.id)
        if (!db.set) db.set = {}
        if (!db.set[botNumber]) db.set[botNumber] = { money: 0 }

        const MIN_BET = 1000

        // ── Validasi argumen ──
        const countRaw = args[0]

        if (!countRaw) {
            return m.reply(
                `🎰 *Cara pakai:*\n` +
                `${prefix}casino <jumlah>\n` +
                `${prefix}casino all\n\n` +
                `📌 Minimal taruhan: *1.000* koin\n` +
                `Contoh: ${prefix}casino 1000`
            )
        }

        if (countRaw !== 'all' && isNaN(countRaw)) {
            return m.reply(`❌ Masukkan jumlah yang valid!\nContoh: ${prefix}casino 1000`)
        }

        let count = countRaw === 'all'
            ? user.money
            : parseInt(countRaw)

        if (count < MIN_BET) {
            return m.reply(`❌ Taruhan minimal adalah *${MIN_BET.toLocaleString('id-ID')}* koin!`)
        }

        if (user.money < count) {
            return m.reply(
                `❌ Uang kamu tidak cukup!\n` +
                `💰 Saldo: *${user.money.toLocaleString('id-ID')}* koin`
            )
        }

        // ── Generate angka ──
        const computerPoint = Math.floor(Math.random() * 101) // 0–100
        const playerPoint   = Math.floor(Math.random() * 81)  // 0–80 (sengaja susah menang)

        // ── Kurangi limit (prioritas limitfree dulu) ──
        if (user.limitfree > 0) user.limitfree -= 1
        else if (user.limitprem > 0) user.limitprem -= 1
        else user.limitbuy -= 1

        // ── Proses taruhan ──
        user.money              -= count
        db.set[botNumber].money += count

        // ── Tentukan hasil & exp ──
        let resultText, resultEmoji, expGained

        if (computerPoint > playerPoint) {
            // Kalah
            resultEmoji = '📉'
            resultText  =
                `*YOU LOSE* 😔\n` +
                `Kamu kehilangan *${count.toLocaleString('id-ID')}* koin`
            expGained = 5

        } else if (computerPoint < playerPoint) {
            // Menang
            user.money              += count * 2
            db.set[botNumber].money -= count
            resultEmoji = '📈'
            resultText  =
                `*YOU WIN!* 🎉\n` +
                `Kamu mendapatkan *${(count * 2).toLocaleString('id-ID')}* koin`
            expGained = 30

        } else {
            // Seri
            user.money              += count
            db.set[botNumber].money -= count
            resultEmoji = '🤝'
            resultText  =
                `*SERI!* 😐\n` +
                `Uangmu dikembalikan *${count.toLocaleString('id-ID')}* koin`
            expGained = 10
        }

        // ── Tambah exp & cek level up ──
        const lvlResult = addExp(user, expGained)

        // ── Bangun baris exp bar ──
        const expNeed    = expToNextLevel(user.level)
        const expBarFull = 10
        const expFilled  = Math.round((user.exp / expNeed) * expBarFull)
        const expBar     = '█'.repeat(expFilled) + '░'.repeat(expBarFull - expFilled)

        // ── Notif level/tier naik ──
        let levelUpText = ''
        if (lvlResult.levelUps > 0) {
            levelUpText = `\n🎊 *LEVEL UP!* ${lvlResult.oldLevel} → *${lvlResult.newLevel}*\n`
            if (lvlResult.tierChanged) {
                levelUpText += `🏅 *TIER NAIK!* ${lvlResult.oldRole} → *${lvlResult.newRole}*\n`
            }
        }

        // ── SAVE KE DATABASE.JSON ──
        try {
            require('fs').writeFileSync('./database/database.json', JSON.stringify(db, null, 2))
        } catch (e) {
            console.error('[gameCasinoSolo] Save DB error:', e)
        }

        return m.reply(
            `💰 *────── CASINO ──────* 💰\n\n` +
            `👤 *Kamu     :* ${playerPoint} Point\n` +
            `🤖 *Computer :* ${computerPoint} Point\n\n` +
            `${resultEmoji} ${resultText}\n` +
            `✨ *EXP      :* +${expGained} exp\n` +
            `${levelUpText}\n` +
            `📊 *${roleFromLevel(user.level)}*  Lv.${user.level}\n` +
            `[${expBar}] ${user.exp}/${expNeed}\n\n` +
            `💰 *Saldo:* ${user.money.toLocaleString('id-ID')} koin\n` +
            `💰 *────────────────────* 💰`
        )

    } catch (e) {
        console.error('[gameCasinoSolo]', e)
        return m.reply('❌ Terjadi error saat bermain casino!')
    }
}

module.exports = { gameCasinoSolo }