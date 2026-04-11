const toSmallCaps = (text) => {
    const smallCapsMap = {
        a: 'ᴀ', b: 'ʙ', c: 'ᴄ', d: 'ᴅ', e: 'ᴇ', f: 'ғ', g: 'ɢ', h: 'ʜ', i: 'ɪ', j: 'ᴊ',
        k: 'ᴋ', l: 'ʟ', m: 'ᴍ', n: 'ɴ', o: 'ᴏ', p: 'ᴘ', q: 'ǫ', r: 'ʀ', s: 's', t: 'ᴛ',
        u: 'ᴜ', v: 'ᴠ', w: 'ᴡ', x: 'x', y: 'ʏ', z: 'ᴢ'
    };
    return text.toLowerCase().split('').map(c => smallCapsMap[c] || c).join('');
};

const roleFromLevel = (level) => {
    if (level <= 10) return 'Novice 🔰';
    if (level <= 20) return 'Fighter ⚔️';
    if (level <= 30) return 'Warrior 🗡️';
    if (level <= 40) return 'Elite Warrior 🛡️';
    if (level <= 50) return 'Master 🔱';
    if (level <= 80) return 'Grandmaster 🏵️';
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

module.exports = {
    toSmallCaps,
    roleFromLevel,
    emoticon
};