const axios = require('axios');
const fs = require('fs');
const path = require('path');

const CACHE_FILE = path.join(__dirname, '../database/daerah_sholat.json');

async function initDaerah() {
    if (fs.existsSync(CACHE_FILE)) {
        return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
    }

    let allDaerah = [];
    try {
        const { data: provData } = await axios.get('https://equran.id/api/v2/shalat/provinsi');
        if (provData.code === 200) {
            const provinces = provData.data;
            
            for (let prov of provinces) {
                const { data: kabData } = await axios.post('https://equran.id/api/v2/shalat/kabkota', { provinsi: prov });
                if (kabData.code === 200) {
                    for (let kota of kabData.data) {
                        allDaerah.push({ provinsi: prov, kota: kota });
                    }
                }
                await new Promise(r => setTimeout(r, 200)); 
            }
            
            fs.writeFileSync(CACHE_FILE, JSON.stringify(allDaerah, null, 2));
            return allDaerah;
        }
    } catch (e) {
        console.error(e);
        return [];
    }
}

async function searchDaerah(query) {
    const data = await initDaerah();
    query = query.toLowerCase().trim();

    let cleanQuery = query.replace(/^(kab\.|kota)\s+/i, '').trim();

    let matches = data.filter(d => {
        let cleanKota = d.kota.toLowerCase().replace(/^(kab\.|kota)\s+/i, '').trim();
        return cleanKota.includes(cleanQuery) || d.kota.toLowerCase().includes(query) || d.provinsi.toLowerCase().includes(cleanQuery);
    });

    let exactMatches = matches.filter(d => {
        let cleanKota = d.kota.toLowerCase().replace(/^(kab\.|kota)\s+/i, '').trim();
        return cleanKota === cleanQuery;
    });

    if (exactMatches.length > 0 && exactMatches.length < matches.length) {
         matches = exactMatches;
    }

    return matches;
}

module.exports = { searchDaerah };