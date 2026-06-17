const isNumber = x => typeof x === 'number' && !isNaN(x)
const fs = require('fs')

const initDatabase = (m, isChannel) => {
    const moment = require('moment-timezone');
    let today = moment().tz('Asia/Jakarta').format('YYYY-MM-DD');

    if (!global.dbRole) {
        if (fs.existsSync('./database/roles.json')) {
            global.dbRole = JSON.parse(fs.readFileSync('./database/roles.json', 'utf-8'));
        } else {
            global.dbRole = {};
        }
    }

    if (m.isGroup) {
        if (!global.dbRole[m.chat]) {
            global.dbRole[m.chat] = { list: [], members: {} };
            try {
                fs.writeFileSync('./database/roles.json', JSON.stringify(global.dbRole, null, 2));
            } catch(e) {}
        }
    }
    
    if (!global.db.settings) global.db.settings = {}; 

    if (!global.db.settings.lastResetLimit || global.db.settings.lastResetLimit !== today) {
        for (let jid in global.db.users) {
            let user = global.db.users[jid];
            if (typeof user === 'object') {
                user.limitfree = 15; 
                
                let isPrem = user.premium || (global.premium && global.premium.includes(jid.split('@')[0]));
                if (isPrem) {
                    user.limitprem = 500; 
                } else {
                    user.limitprem = 0;   
                }
            }
        }
        global.db.settings.lastResetLimit = today;
        try { fs.writeFileSync('./database/database.json', JSON.stringify(global.db, null, 2)); } catch(e){}
    }

    if (m.sender && !isChannel) {
        let user = global.db.users[m.sender]
        
        if (typeof user !== 'object') global.db.users[m.sender] = {}
        user = global.db.users[m.sender]
        
        let isPrem = user.premium || (global.premium && global.premium.includes(m.sender.split('@')[0]));

        if (user) {
            if (!isNumber(user.level)) user.level = 0
            if (!isNumber(user.exp)) user.exp = 0
            if (!isNumber(user.money)) user.money = 0
            if (!isNumber(user.bank)) user.bank = 0
            if (!isNumber(user.health)) user.health = 100

            if (!isNumber(user.limitfree)) user.limitfree = 15
            if (!isNumber(user.limitprem)) user.limitprem = isPrem ? 500 : 0
            if (!isNumber(user.limitbuy)) user.limitbuy = 0
            
            if (!isNumber(user.lastmining)) user.lastmining = 0
            if (!isNumber(user.lastdungeon)) user.lastdungeon = 0
            if (!user.name) user.name = m.pushName || 'Unknown'
            if (typeof user.registered !== 'boolean') user.registered = false
        } else {
            global.db.users[m.sender] = {
                level: 0,
                exp: 0,
                money: 0,
                bank: 0,
                health: 100,
                limitfree: 15,
                limitprem: isPrem ? 500 : 0,
                limitbuy: 0,
                lastmining: 0,
                lastdungeon: 0,
                name: m.pushName || 'Unknown',
                registered: false
            }
        }
    }
}

const getLimitCost = (command, defaultCost) => {
    if (!global.db.settings.cmdLimit) global.db.settings.cmdLimit = {};
    return global.db.settings.cmdLimit[command] !== undefined ? global.db.settings.cmdLimit[command] : defaultCost;
}

const checkLimit = (sender, isOwner) => {
    if (isOwner) return "∞"; 
    
    let user = global.db.users[sender];
    if (!user) return 0;
    
    let free = isNumber(user.limitfree) ? user.limitfree : 0;
    let prem = isNumber(user.limitprem) ? user.limitprem : 0;
    let buy = isNumber(user.limitbuy) ? user.limitbuy : 0;
    return free + prem + buy;
}

const useLimit = (sender, amount, isOwner) => {
    if (isOwner || amount <= 0) return true; 
    
    let user = global.db.users[sender];
    if (!user) return false;

    let totalLimit = checkLimit(sender, false); 
    if (totalLimit < amount) return false; 

    let needed = amount;
    if (user.limitfree >= needed) {
        user.limitfree -= needed;
    } else {
        needed -= user.limitfree;
        user.limitfree = 0;
        
        if (user.limitprem >= needed) {
            user.limitprem -= needed;
        } else {
            needed -= user.limitprem;
            user.limitprem = 0;
            user.limitbuy -= needed;
        }
    }
    return true;
}

// ═══════════════════════════════════════════════════════════════════════════════
// REGISTRATION SYSTEM — Fungsi-fungsi untuk daftar/register
// ═══════════════════════════════════════════════════════════════════════════════

// ─── GENERATE REG-ID ──────────────────────────────────────────────────────────
const generateRegId = () => {
    const timestamp = Date.now().toString().slice(-6)
    const random = Math.random().toString(36).substr(2, 6).toUpperCase()
    return `REG-${timestamp}-${random}`
}

// ─── VALIDASI NAMA ────────────────────────────────────────────────────────────
// Hanya huruf (a-z, A-Z) dan spasi, minimal 3 karakter
const isValidName = (name) => {
    return /^[a-zA-Z\s]{3,30}$/.test(name.trim())
}

// ─── VALIDASI UMUR ────────────────────────────────────────────────────────────
// Umur 15-35 tahun
const isValidAge = (age) => {
    const num = parseInt(age)
    return !isNaN(num) && num >= 15 && num <= 35
}

// ─── CEK STATUS REGISTRASI ────────────────────────────────────────────────────
const getRegStatus = (user) => {
    return {
        registered: user.registered === true,
        regId: user.regId || null,
        name: user.regName || null,
        age: user.regAge || null
    }
}

// ─── DAFTAR / REGISTER ────────────────────────────────────────────────────────
// Command: .daftar <nama> <umur>
const cmdRegister = async (m, db, args) => {
    try {
        if (!db.users[m.sender]) {
            db.users[m.sender] = {
                level: 0,
                exp: 0,
                money: 0,
                bank: 0,
                health: 100,
                limitfree: 15,
                registered: false
            }
        }

        const user = db.users[m.sender]

        if (user.registered === true) {
            return m.reply(
                `❌ Kamu sudah mendaftar!\n\n` +
                `📋 *REG-ID :* ${user.regId}\n` +
                `👤 *Nama   :* ${user.regName}\n` +
                `🎂 *Umur   :* ${user.regAge} tahun\n\n` +
                `Ketik *.profile setname <nama_baru>* untuk ganti nama`
            )
        }

        if (args.length < 2) {
            return m.reply(
                `📋 *Cara daftar:*\n` +
                `.daftar <nama> <umur>\n\n` +
                `📌 Ketentuan:\n` +
                `• Nama hanya huruf (3–30 karakter)\n` +
                `• Umur 15–35 tahun\n\n` +
                `Contoh: *.daftar Budi 25*`
            )
        }

        const name = args[0]
        const age  = args[1]

        if (!isValidName(name)) {
            return m.reply(
                `❌ Nama tidak valid!\n\n` +
                `📌 Nama harus:\n` +
                `• Hanya huruf (a-z, A-Z)\n` +
                `• Minimal 3 karakter\n` +
                `• Maksimal 30 karakter\n\n` +
                `Contoh: *.daftar Budi 25*`
            )
        }

        if (!isValidAge(age)) {
            return m.reply(
                `❌ Umur tidak valid!\n\n` +
                `📌 Umur harus:\n` +
                `• Minimum 15 tahun\n` +
                `• Maksimum 35 tahun\n\n` +
                `Contoh: *.daftar Budi 25*`
            )
        }

        const regId = generateRegId()
        user.registered = true
        user.regId = regId
        user.regName = name.trim()
        user.regAge = parseInt(age)

        try {
            fs.writeFileSync('./database/database.json', JSON.stringify(db, null, 2))
        } catch (e) {}

        return m.reply(
            `✅ *Daftar Berhasil!*\n\n` +
            `🎟️ *REG-ID  :* \`${regId}\`\n` +
            `👤 *Nama    :* ${user.regName}\n` +
            `🎂 *Umur    :* ${user.regAge} tahun\n\n` +
            `📌 Selamat datang! Sekarang kamu bisa menikmati semua fitur game. 🎮`
        )

    } catch (e) {
        console.error('[cmdRegister]', e)
        return m.reply('❌ Terjadi error saat mendaftar!')
    }
}

// ─── GANTI NAMA ───────────────────────────────────────────────────────────────
// Command: .profile setname <nama_baru>
const cmdSetName = async (m, db, args) => {
    try {
        if (!db.users[m.sender]) {
            return m.reply('❌ Kamu belum terdaftar. Ketik *.daftar nama umur* untuk mendaftar!')
        }

        const user = db.users[m.sender]

        if (user.registered !== true) {
            return m.reply('❌ Kamu belum mendaftar. Ketik *.daftar nama umur* untuk mendaftar!')
        }

        if (!args[1]) {
            return m.reply(
                `📋 *Cara ganti nama:*\n` +
                `.profile setname <nama_baru>\n\n` +
                `Contoh: *.profile setname Ahmad*`
            )
        }

        const newName = args[1]

        if (!isValidName(newName)) {
            return m.reply(
                `❌ Nama tidak valid!\n\n` +
                `📌 Nama harus:\n` +
                `• Hanya huruf (a-z, A-Z)\n` +
                `• Minimal 3 karakter\n` +
                `• Maksimal 30 karakter`
            )
        }

        const oldName = user.regName
        user.regName = newName.trim()

        try {
            fs.writeFileSync('./database/database.json', JSON.stringify(db, null, 2))
        } catch (e) {}

        return m.reply(
            `✅ *Nama Berhasil Diubah!*\n\n` +
            `👤 *Nama Lama :* ${oldName}\n` +
            `👤 *Nama Baru :* ${user.regName}`
        )

    } catch (e) {
        console.error('[cmdSetName]', e)
        return m.reply('❌ Terjadi error saat mengubah nama!')
    }
}

// ─── UNDAFTAR ─────────────────────────────────────────────────────────────────
// Command: .undaftar
const cmdUnregister = async (m, db) => {
    try {
        if (!db.users[m.sender]) {
            return m.reply('❌ Kamu belum mendaftar!')
        }

        const user = db.users[m.sender]

        if (user.registered !== true) {
            return m.reply('❌ Kamu belum mendaftar!')
        }

        const regId = user.regId
        const name = user.regName

        user.registered = false
        delete user.regId
        delete user.regName
        delete user.regAge

        user.level = 0
        user.exp = 0
        user.money = 0
        user.health = 100
        user.lastDaily = 0
        user.dailyStreak = 0

        try {
            fs.writeFileSync('./database/database.json', JSON.stringify(db, null, 2))
        } catch (e) {}

        return m.reply(
            `✅ *Undaftar Berhasil!*\n\n` +
            `🎟️ *REG-ID :* ${regId}\n` +
            `👤 *Nama   :* ${name}\n\n` +
            `📌 Data kamu telah dihapus. Ketik *.daftar nama umur* untuk mendaftar kembali.`
        )

    } catch (e) {
        console.error('[cmdUnregister]', e)
        return m.reply('❌ Terjadi error saat undaftar!')
    }
}

// ─── PROFILE ───────────────────────────────────────────────────────────────────
// Command: .profile
// .profile setname <nama_baru> — untuk ganti nama
const cmdProfile = async (m, db, args) => {
    try {
        if (!db.users[m.sender]) {
            return m.reply('❌ Kamu belum terdaftar di sistem!')
        }

        const user = db.users[m.sender]
        const { registered, regId, name, age } = getRegStatus(user)

        // Jika ada arg "setname", proses ganti nama
        if (args.length > 0 && args[0].toLowerCase() === 'setname') {
            return await cmdSetName(m, db, args)
        }

        if (!registered) {
            return m.reply(
                `❌ Kamu belum mendaftar!\n\n` +
                `Ketik *.daftar nama umur* untuk mendaftar\n\n` +
                `Contoh: *.daftar Budi 25*`
            )
        }

        const { roleFromLevel } = require('./rpg')
        const role = roleFromLevel(user.level || 0)

        return m.reply(
            `👤 *───── PROFILE KAMU ─────* 👤\n\n` +
            `🎟️ *REG-ID  :* \`${regId}\`\n` +
            `👤 *Nama    :* ${name}\n` +
            `🎂 *Umur    :* ${age} tahun\n\n` +
            `🏅 *Tier   :* ${role}\n` +
            `📊 *Level  :* ${user.level || 0}\n` +
            `✨ *EXP    :* ${user.exp || 0}\n\n` +
            `💰 *Koin   :* ${(user.money || 0).toLocaleString('id-ID')}\n` +
            `🏦 *Bank   :* ${(user.bank || 0).toLocaleString('id-ID')}\n` +
            `❤️ *Health :* ${user.health || 100}\n\n` +
            `📝 Ketik *.profile setname <nama_baru>* untuk ganti nama\n` +
            `👤 *──────────────────────* 👤`
        )

    } catch (e) {
        console.error('[cmdProfile]', e)
        return m.reply('❌ Terjadi error saat cek profile!')
    }
}

// ─── SET DAFTAR MODE (ON/OFF) ─────────────────────────────────────────────────
// Command: .setdaftar <on|off>
// Owner only
const cmdSetDaftarMode = async (m, db, args, isOwner) => {
    try {
        if (!isOwner) {
            return m.reply('❌ Hanya owner yang bisa menggunakan command ini!')
        }

        const mode = args[0]?.toLowerCase()

        if (!mode || !['on', 'off'].includes(mode)) {
            const status = global.db.settings.registrationRequired ? '✅ ON' : '❌ OFF'
            return m.reply(
                `📋 *Cara pakai:*\n` +
                `.setdaftar <on|off>\n\n` +
                `Status saat ini: *${status}*\n\n` +
                `• *on*  = User harus daftar sebelum pakai fitur game\n` +
                `• *off* = User langsung bisa pakai fitur tanpa daftar`
            )
        }

        global.db.settings.registrationRequired = mode === 'on'

        try {
            fs.writeFileSync('./database/database.json', JSON.stringify(global.db, null, 2))
        } catch (e) {}

        const newStatus = global.db.settings.registrationRequired ? '✅ ON' : '❌ OFF'
        return m.reply(
            `✅ *Registration Mode Berhasil Diubah!*\n\n` +
            `Status: ${newStatus}\n\n` +
            `${global.db.settings.registrationRequired 
                ? '🔒 Fitur game memerlukan registrasi' 
                : '🔓 Fitur game terbuka untuk semua'}`
        )

    } catch (e) {
        console.error('[cmdSetDaftarMode]', e)
        return m.reply('❌ Terjadi error!')
    }
}

module.exports = { 
    initDatabase, 
    getLimitCost, 
    checkLimit, 
    useLimit,
    // Registration functions
    generateRegId,
    isValidName,
    isValidAge,
    getRegStatus,
    cmdRegister,
    cmdSetName,
    cmdUnregister,
    cmdProfile,
    cmdSetDaftarMode
}