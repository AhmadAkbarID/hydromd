const isNumber = x => typeof x === 'number' && !isNaN(x)

const initDatabase = (m, isChannel) => {
    if (m.sender && !isChannel) {
        let user = global.db.users[m.sender]
        
        if (typeof user !== 'object') global.db.users[m.sender] = {}
        user = global.db.users[m.sender]
        
        if (user) {
            if (!isNumber(user.level)) user.level = 0
            if (!isNumber(user.exp)) user.exp = 0
            if (!isNumber(user.money)) user.money = 0
            if (!isNumber(user.bank)) user.bank = 0
            if (!isNumber(user.health)) user.health = 100
            if (!isNumber(user.limit)) user.limit = 10
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
                limit: 10,
                lastmining: 0,
                lastdungeon: 0,
                name: m.pushName || 'Unknown',
                registered: false
            }
        }
    }
}

module.exports = { initDatabase }