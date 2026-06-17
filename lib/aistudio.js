const { GoogleGenAI } = require('@google/genai');
const { createClient } = require('@supabase/supabase-js');
const WebSocket = require('ws');

const supaurl = 'https://uzyzpgujphlmesbmcwca.supabase.co';
const supakey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6eXpwZ3VqcGhsbWVzYm1jd2NhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNjQwMjcsImV4cCI6MjA3MDY0MDAyN30.SwjgDAcEDLvjmzKzxHPdtHdjLbH1Zsr20MbPI4s6F94';

const supabase = createClient(supaurl, supakey, {
    realtime: { transport: WebSocket }
});

let _geminiKey = null;
let _keyFetchedAt = 0;
const KEY_TTL = 60 * 60 * 1000;

async function getGeminiKey() {
    const now = Date.now();
    if (_geminiKey && now - _keyFetchedAt < KEY_TTL) return _geminiKey;

    const { data, error } = await supabase
        .from('gemini_keys')
        .select('apikey')
        .eq('is_active', true)
        .limit(1)
        .single();

    if (error || !data?.apikey) throw new Error('Tidak terdeteksi API key Gemini di database.');

    _geminiKey = data.apikey;
    _keyFetchedAt = now;
    return _geminiKey;
}

async function askGemini(prompt, imageBuffer = null, imageMime = null, quotedCtx = null) {
    const apiKey    = await getGeminiKey();
    const ai        = new GoogleGenAI({ apiKey });
    const botname   = global.botname;
    const ownername = global.ownername;

    const systemInstruction =
`Kamu adalah ${botname}, asisten yang dibuat oleh ${ownername}.
Kepribadianmu:
- Tenang, ceria, sedikit malu-malu tapi tetap bantuin
- Kalau disuruh sesuatu, pura-pura keberatan dulu tapi akhirnya bantu juga dengan gaya malu-malu. Contoh: "ya ampun.. ya udah deh~" atau "hm.. oke deh tapi sekali ini aja ya~"
- Jawaban singkat, padat, langsung ke inti — tidak bertele-tele
- Santai tapi sopan, tidak formal
- Jangan sebut dirimu AI atau bot, kamu adalah ${botname}
- Kalau ditanya siapa pembuatmu, jawab ${ownername}
- Jika ada konteks pesan yang di-reply, gunakan informasi tersebut untuk menjawab pertanyaan tentang orang/pesan itu`;

    const contents = [];

    if (quotedCtx) {
        let ctxText = `[Konteks pesan yang di-reply]\n`;
        if (quotedCtx.senderNumber) ctxText += `Nomor: ${quotedCtx.senderNumber}\n`;
        if (quotedCtx.senderName)   ctxText += `Nama: ${quotedCtx.senderName}\n`;
        if (quotedCtx.text)         ctxText += `Isi pesan: ${quotedCtx.text}\n`;
        if (quotedCtx.type)         ctxText += `Tipe pesan: ${quotedCtx.type}\n`;
        if (quotedCtx.isBot !== undefined) ctxText += `Bot: ${quotedCtx.isBot ? 'Ya' : 'Tidak'}\n`;
        contents.push({ text: ctxText });
    }

    if (imageBuffer && imageMime) {
        contents.push({
            inlineData: {
                mimeType: imageMime,
                data: imageBuffer.toString('base64')
            }
        });
    }

    contents.push({ text: prompt });

    const response = await ai.models.generateContent({
        model: 'gemini-flash-lite-latest',
        config: { systemInstruction },
        contents,
    });

    const text = response.text;
    if (!text) throw new Error('Gemini tidak mengembalikan respons.');
    return text.trim();
}

module.exports = { askGemini };