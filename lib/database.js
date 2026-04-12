const isNumber = x => typeof x === 'number' && !isNaN(x)

const initDatabase = (m, isChannel) => {
    const moment = require('moment-timezone');
    const fs = require('fs');
    let today = moment().tz('Asia/Jakarta').format('YYYY-MM-DD');
    
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

module.exports = { initDatabase, getLimitCost, checkLimit, useLimit }