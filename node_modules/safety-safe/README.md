
# safety-safe
Firewall Cerdas untuk Bot WhatsApp Anda.

[![NPM Version](https://img.shields.io/npm/v/safety-safe?color=red&logo=npm)](https://www.npmjs.com/package/safety-safe) [![NPM License](https://img.shields.io/npm/l/safety-safe?color=blue)](LICENSE)

Bot Anda sering *crash*, nge-lag, atau tidak responsif karena dikirimi pesan aneh? `safety-safe` adalah solusi yang Anda butuhkan. Ini adalah sebuah package ringan tanpa dependensi yang bertugas menganalisis setiap pesan masuk dan mendeteksi berbagai jenis bug, *crash*, dan eksploit yang berbahaya.

---

### Mengapa `safety-safe`?

*   **🛡️ Komprehensif:** Mampu mendeteksi berbagai vektor serangan, mulai dari teks panjang, *mention* masif, hingga bug yang lebih licik seperti `albumMessage`, `liveLocationMessage`, dan `productMessage` berbahaya.
*   **⚡ Super Ringan:** **Zero-dependency.** Package ini tidak akan menambah beban pada `node_modules` Anda. Cepat, efisien, dan fokus pada satu tugas.
*   **🔧 Fleksibel:** Kami percaya pada kontrol pengguna. `safety-safe` bertugas sebagai **detektor**, bukan eksekutor. Anda yang memutuskan tindakan apa yang akan diambil terhadap pesan berbahaya.
*   **🔌 Mudah Diintegrasikan:** Dirancang untuk bekerja mulus dengan `@whiskeysockets/baileys` atau library WhatsApp lainnya, dan mendukung baik CommonJS maupun ES Modules.

### Instalasi
Gak pake ribet. Cukup satu baris di terminal Anda:
```bash
npm install safety-safe
```

---

### Cara Penggunaan

Inti dari package ini adalah fungsi tunggal bernama `analyzeMessage`. Fungsi ini menerima objek `message` dari Baileys dan mengembalikan hasil analisis dalam format: `{ isMalicious: boolean, reason: string | null }`.

#### 1. Impor Package
Pilih metode yang sesuai dengan proyek Anda.

**Untuk proyek CommonJS (`require`):**
```javascript
const { analyzeMessage } = require('safety-safe');
```

**Untuk proyek ES Modules (`import`):**
```javascript
import { analyzeMessage } from 'safety-safe';
```
> *Catatan: Contoh-contoh selanjutnya akan menggunakan sintaks `require`, namun logikanya 100% sama untuk pengguna `import`.*

#### 2. Implementasi di Bot Anda

Berikut adalah contoh paling umum: jika pesan terdeteksi berbahaya, langsung hapus pesannya dan blokir pengirimnya.

```javascript
// Di dalam file utama bot Anda
const { makeWASocket } = require('@whiskeysockets/baileys');
const { analyzeMessage } = require('safety-safe');

const client = makeWASocket({ /* ...konfigurasi Anda */ });
const myNumber = "6281234567890"; // Ganti dengan nomor Admin/Owner

client.ev.on('messages.upsert', async (m) => {
    const msg = m.messages[0];

    // Abaikan jika pesan tidak valid, dari diri sendiri, atau dari grup
    if (!msg.message || msg.key.fromMe || msg.key.remoteJid.endsWith('@g.us')) {
        return;
    }

    // Analisis pesan dengan safety-safe
    const { isMalicious, reason } = analyzeMessage(msg.message);

    if (isMalicious) {
        console.log(`[!] Ancaman Terdeteksi dari ${msg.pushName} (${msg.key.remoteJid}).\n    Alasan: ${reason}`);
        
        try {
            // CONTOH AKSI: Hapus pesan, blokir, dan kirim notifikasi ke Admin
            await client.sendMessage(msg.key.remoteJid, { delete: msg.key });
            await client.updateBlockStatus(msg.key.remoteJid, "block");

            await client.sendMessage(`${myNumber}@s.whatsapp.net`, { 
                text: `🔒 User *${msg.pushName}* (${msg.key.remoteJid}) telah diblokir secara otomatis.\nAlasan: *${reason}*.`
            });

        } catch (err) {
            console.error('[!] Gagal melakukan aksi blokir/hapus:', err);
        }
        return; // Hentikan pemrosesan pesan ini
    }

    // Jika pesan aman, lanjutkan dengan logika bot normal Anda...
});
```

#### 3. Contoh Aksi Lainnya

Kekuatan `safety-safe` ada pada fleksibilitasnya. Berikut beberapa ide aksi lain yang bisa Anda terapkan di dalam `if (isMalicious) { ... }`:

##### **Hanya Kirim Peringatan**
```javascript
await client.sendMessage(msg.key.remoteJid, {
    text: `⚠️ *Peringatan!* Pesan Anda terdeteksi sebagai potensi bug (${reason}). Jangan ulangi lagi!`
});
await client.sendMessage(msg.key.remoteJid, { delete: msg.key });
```

##### **Teruskan Bukti ke Admin dengan Media**
Fitur ini berguna untuk menganalisis bug baru tanpa membuat bot Anda *crash*.
```javascript
// Mengirim thumbnail dan detail ancaman ke admin
await client.sendMessage(`${myNumber}@s.whatsapp.net`, {
    image: { url: './path/to/your/warning-image.jpg' }, // Ganti dengan path gambar Anda
    caption: `*Ancaman Terdeteksi!*\n\n*Dari:* ${msg.pushName}\n*Nomor:* ${msg.key.remoteJid}\n*Alasan:* ${reason}\n\n*Pesan Asli Diteruskan di bawah ini (hati-hati saat membuka):*`
});

// Forward pesan aslinya untuk diinspeksi
// PERINGATAN: Meneruskan pesan kadang bisa membuat app WhatsApp admin lag jika bug-nya parah.
await client.forwardMessage(`${myNumber}@s.whatsapp.net`, msg, {});
```

---

### Filosofi Desain: Kenapa Aksi Tidak Langsung di Dalam Package?

Kami sengaja memisahkan **deteksi** dari **aksi**. Bayangkan `safety-safe` adalah **detektor asap**. Tugasnya adalah berbunyi nyaring saat ada bahaya. Ia tidak bertugas menyemprotkan air. Anda, sebagai pemilik gedung (bot), yang memutuskan apakah akan menyalakan *sprinkler*, menelepon pemadam kebakaran, atau hanya mengipas-ngipas asapnya.

Pemisahan ini memberikan Anda **kontrol penuh** dan membuat `safety-safe` tetap ringan dan tidak bergantung pada objek `client` dari Baileys.

---

### Daftar Ancaman yang Dideteksi
Versi saat ini mampu mendeteksi berbagai serangan, termasuk:
- [x] Teks/Caption dengan Panjang Ekstrem
- [x] Kepadatan Karakter *Invisible*/Kontrol Unicode
- [x] Jumlah Mention JID yang Masif
- [x] Tipe `ProtocolMessage` yang Tidak Wajar
- [x] Bug `AlbumMessage`, `ListMessage`, `ButtonsMessage`
- [x] Serangan `VideoMessage` dengan `Annotations` Berbahaya
- [x] Bug `externalAdReply` dengan Teks Sangat Panjang
- [x] Pesan Media dengan Properti Mustahil (*fileLength*, *duration*)
- [x] Bug pada `Location`, `Contact`, `LiveLocation`, `Product`, dan `OrderMessage`.

---

### Kontribusi
Punya ide untuk deteksi bug baru? Menemukan celah? Jangan ragu untuk membuat *Pull Request* atau membuka *Issue* di repository GitHub. Kontribusi Anda sangat kami hargai!

### Lisensi
Proyek ini dilisensikan di bawah [Lisensi MIT](LICENSE).
