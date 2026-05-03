const { createCanvas, registerFont, loadImage } = require('canvas');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const webpmux = require('node-webpmux');

try {
    const fontPath = path.join(__dirname, '../media/font/Aptos.ttf');
    if (fs.existsSync(fontPath)) {
        registerFont(fontPath, { family: 'Aptos' });
    }

    const sfPath = path.join(__dirname, '../media/font/SFUIDisplay-Semibold.otf');
    if (fs.existsSync(sfPath)) {
        registerFont(sfPath, { family: 'SFUI' });
    }

    const emojiPath = path.join(__dirname, '../media/font/NotoColorEmoji.ttf');
    if (fs.existsSync(emojiPath)) {
        registerFont(emojiPath, { family: 'NotoColorEmoji' });
    }
} catch (e) {}

const CONFIG = {
    bgColor: 'white',      
    textColor: 'black',    
    padding: 40,           
    startFontSize: 130,
    minFontSize: 10,       
    quality: 50,
    vidFps: '5/3'
};

function getFinalFontSize(text, width = 512, height = 512) {
    const maxTextWidth = width - (CONFIG.padding * 2);
    const maxTextHeight = height - (CONFIG.padding * 2);
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    let fontSize = CONFIG.startFontSize;
    let lineHeight = 0;

    while (fontSize >= CONFIG.minFontSize) {
        ctx.font = `${fontSize}px "Aptos", "NotoColorEmoji", Arial`;
        lineHeight = fontSize * 1.1; 

        const words = text.replace(/\n/g, ' \n ').split(' ');
        let lines = [];
        let currentLine = words[0];
        let wordTooLong = false;

        for (let word of words) {
            if (word !== '\n' && ctx.measureText(word).width > maxTextWidth) {
                wordTooLong = true; break;
            }
        }

        if (wordTooLong) { fontSize -= 1; continue; }

        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            if (word === '\n') {
                lines.push(currentLine); currentLine = ''; continue;
            }
            const testLine = currentLine === '' ? word : currentLine + " " + word;
            if (ctx.measureText(testLine).width <= maxTextWidth) {
                currentLine = testLine;
            } else {
                lines.push(currentLine); currentLine = word;
            }
        }
        if (currentLine !== '') lines.push(currentLine);

        if (lines.length * lineHeight <= maxTextHeight) break; 
        fontSize -= 1; 
    }
    return fontSize;
}

function drawFrame(text, fontSize, width = 512, height = 512) {
    const maxTextWidth = width - (CONFIG.padding * 2);
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = CONFIG.bgColor;
    ctx.fillRect(0, 0, width, height);

    ctx.font = `${fontSize}px "Aptos", "NotoColorEmoji", Arial`;
    const lineHeight = fontSize * 1.1;

    const words = text.replace(/\n/g, ' \n ').split(' ');
    let lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
        const word = words[i];
        if (word === '\n') {
            lines.push(currentLine); currentLine = ''; continue;
        }
        const testLine = currentLine === '' ? word : currentLine + " " + word;
        if (ctx.measureText(testLine).width <= maxTextWidth) {
            currentLine = testLine;
        } else {
            lines.push(currentLine); currentLine = word;
        }
    }
    if (currentLine !== '') lines.push(currentLine);

    ctx.fillStyle = CONFIG.textColor;
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';
    
    let startY = CONFIG.padding;

    for (let i = 0; i < lines.length; i++) {
        let textY = startY + (i * lineHeight);
        ctx.fillText(lines[i], CONFIG.padding, textY);
    }

    return canvas.toBuffer('image/png');
}

async function makeBrat(text) {
    let finalFontSize = getFinalFontSize(text, 512, 512);
    return drawFrame(text, finalFontSize, 512, 512);
}

async function addExif(webpBuffer, packname, author) {
    if (!packname && !author) return webpBuffer;
    try {
        const img = new webpmux.Image();
        await img.load(webpBuffer);
        const json = {
            "sticker-pack-id": "hydrobot",
            "sticker-pack-name": packname,
            "sticker-pack-publisher": author,
            "emojis": ["🌊"]
        };
        const exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
        const jsonBuff = Buffer.from(JSON.stringify(json), "utf-8");
        const exif = Buffer.concat([exifAttr, jsonBuff]);
        exif.writeUIntLE(jsonBuff.length, 14, 4);
        img.exif = exif;
        return await img.save(null);
    } catch (e) {
        return webpBuffer;
    }
}

async function makeBratVid(text, packname = '', author = '') {
    return new Promise(async (resolve, reject) => {
        if (!fs.existsSync('./temp')) fs.mkdirSync('./temp');
        let ranId = crypto.randomBytes(4).toString('hex');
        let outWebp = path.join('./temp', `${ranId}_out.webp`);
        let frameFiles = [];
        
        try {
            text = text.trim().replace(/\s+/g, ' '); 
            let words = text.split(' ');

            if (words.length === 1) {
                let singleBuffer = await makeBrat(text);
                let webpBuffer = await toSticker(singleBuffer, packname, author);
                return resolve(webpBuffer);
            }

            let finalFontSize = getFinalFontSize(text, 512, 512);

            for (let i = 0; i < words.length; i++) {
                let currentText = words.slice(0, i + 1).join(' ');
                let buffer = drawFrame(currentText, finalFontSize, 512, 512);
                let framePath = path.join('./temp', `${ranId}_${i}.png`);
                fs.writeFileSync(framePath, buffer);
                frameFiles.push(framePath);
            }

            let lastFrameIndex = words.length - 1;
            let holdFrames = 3; 
            for (let i = 1; i <= holdFrames; i++) {
                let buffer = drawFrame(text, finalFontSize, 512, 512);
                let framePath = path.join('./temp', `${ranId}_${lastFrameIndex + i}.png`);
                fs.writeFileSync(framePath, buffer);
                frameFiles.push(framePath);
            }

            let inputPattern = path.join('./temp', `${ranId}_%d.png`);
            let ffmpegCmd = `ffmpeg -framerate ${CONFIG.vidFps} -i ${inputPattern} -vcodec libwebp -q:v ${CONFIG.quality} -preset default -loop 0 -an -vsync 0 -s 512:512 ${outWebp}`;

            exec(ffmpegCmd, async (err) => {
                frameFiles.forEach(f => { if (fs.existsSync(f)) fs.unlinkSync(f); });
                if (err) {
                    if (fs.existsSync(outWebp)) fs.unlinkSync(outWebp);
                    return reject(err);
                }
                let webpBuffer = fs.readFileSync(outWebp);
                
                if (packname || author) {
                    webpBuffer = await addExif(webpBuffer, packname, author);
                }
                
                fs.unlinkSync(outWebp);
                resolve(webpBuffer);
            });

        } catch (error) {
            frameFiles.forEach(f => { if (fs.existsSync(f)) fs.unlinkSync(f); });
            reject(error);
        }
    });
}

async function makeQC(text, name, avatarUrl) {
    let avatar;
    try {
        avatar = await loadImage(avatarUrl);
    } catch {
        avatar = await loadImage('https://telegra.ph/file/320b066dc81928b782c7b.png');
    }

    const nameFont = 'bold 22px "SFUI", "NotoColorEmoji", Arial';
    const textFont = '22px "SFUI", "NotoColorEmoji", Arial';

    const tempCanvas = createCanvas(512, 512);
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.font = textFont;

    const words = text.replace(/\n/g, ' \n ').split(' ');
    let lines = [];
    let currentLine = '';
    const maxTextWidth = 350; 

    for (let word of words) {
        if (word === '\n') {
            lines.push(currentLine); currentLine = ''; continue;
        }
        let testLine = currentLine === '' ? word : currentLine + ' ' + word;
        if (tempCtx.measureText(testLine).width > maxTextWidth) {
            lines.push(currentLine);
            currentLine = word;
        } else {
            currentLine = testLine;
        }
    }
    if (currentLine !== '') lines.push(currentLine);

    tempCtx.font = nameFont;
    let longestWidth = tempCtx.measureText(name).width; 
    tempCtx.font = textFont;
    for (let line of lines) {
        let w = tempCtx.measureText(line).width;
        if (w > longestWidth) longestWidth = w;
    }

    const bubbleWidth = longestWidth + 35; 
    const lineHeight = 30;
    const bubbleHeight = 45 + (lines.length * lineHeight); 

    const contentWidth = 75 + bubbleWidth; 
    const contentHeight = Math.max(60, bubbleHeight); 

    const padding = 20; 
    const size = Math.max(contentWidth, contentHeight) + (padding * 2);

    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    const startX = (size - contentWidth) / 2;
    const startY = (size - contentHeight) / 2;

    ctx.save();
    ctx.beginPath();
    ctx.arc(startX + 30, startY + 30, 30, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, startX, startY, 60, 60);
    ctx.restore();

    const bubbleX = startX + 75;
    const bubbleY = startY;
    ctx.fillStyle = '#202c33'; 

    ctx.beginPath();
    const radius = 12;
    ctx.moveTo(bubbleX + radius, bubbleY);
    ctx.lineTo(bubbleX + bubbleWidth - radius, bubbleY);
    ctx.quadraticCurveTo(bubbleX + bubbleWidth, bubbleY, bubbleX + bubbleWidth, bubbleY + radius);
    ctx.lineTo(bubbleX + bubbleWidth, bubbleY + bubbleHeight - radius);
    ctx.quadraticCurveTo(bubbleX + bubbleWidth, bubbleY + bubbleHeight, bubbleX + bubbleWidth - radius, bubbleY + bubbleHeight);
    ctx.lineTo(bubbleX + radius, bubbleY + bubbleHeight);
    ctx.quadraticCurveTo(bubbleX, bubbleY + bubbleHeight, bubbleX, bubbleY + bubbleHeight - radius);
    ctx.lineTo(bubbleX, bubbleY + radius);
    ctx.quadraticCurveTo(bubbleX, bubbleY, bubbleX + radius, bubbleY);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(bubbleX + 10, bubbleY);
    ctx.lineTo(bubbleX - 10, bubbleY); 
    ctx.lineTo(bubbleX, bubbleY + 15);
    ctx.closePath();
    ctx.fill();

    const nameColors = ['#ff8a8c', '#53d769', '#5bc0de', '#ffc107', '#e5a55d', '#a695e7'];
    const nameColor = nameColors[name.length % nameColors.length];
    ctx.fillStyle = nameColor;
    ctx.font = nameFont;
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
    ctx.fillText(name, bubbleX + 15, bubbleY + 12);

    ctx.fillStyle = '#ffffff';
    ctx.font = textFont;
    let textY = bubbleY + 45;
    for (let line of lines) {
        ctx.fillText(line, bubbleX + 15, textY);
        textY += lineHeight;
    }

    return canvas.toBuffer('image/png');
}

async function toSticker(buffer, packname = '', author = '') {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync('./temp')) fs.mkdirSync('./temp');
        let ranId = crypto.randomBytes(4).toString('hex');
        let tmpIn = path.join('./temp', `${ranId}.png`);
        let tmpOut = path.join('./temp', `${ranId}.webp`);
        
        fs.writeFileSync(tmpIn, buffer);
        
        exec(`ffmpeg -i ${tmpIn} -vcodec libwebp -q:v ${CONFIG.quality} -preset default -an -vsync 0 -s 512:512 ${tmpOut}`, async (err) => {
            if (err) {
                if (fs.existsSync(tmpIn)) fs.unlinkSync(tmpIn);
                return reject(err);
            }
            let webp = fs.readFileSync(tmpOut);
            
            if (packname || author) {
                webp = await addExif(webp, packname, author);
            }
            
            fs.unlinkSync(tmpIn);
            fs.unlinkSync(tmpOut);
            resolve(webp);
        });
    });
}

async function makeStoryIG(text, name, ppUrl) {
    const bgPath = path.join(__dirname, '../media/bg-fakeigstory.jpg');
    const nunitoPath = path.join(__dirname, '../media/font/Nuninto-SemiBold.ttf');
    const cooperPath = path.join(__dirname, '../media/font/Cooper-black.ttf');

    try { registerFont(nunitoPath, { family: 'Nuninto' }); } catch(e){}
    try { registerFont(cooperPath, { family: 'CooperBlack' }); } catch(e){}

    if (!fs.existsSync(bgPath)) throw new Error("File background tidak ditemukan di folder /media");
    let bg = await loadImage(bgPath);
    
    let avatar;
    try {
        avatar = await loadImage(ppUrl);
    } catch {
        avatar = await loadImage('https://telegra.ph/file/320b066dc81928b782c7b.png');
    }

    let canvas = createCanvas(bg.width, bg.height);
    let ctx = canvas.getContext('2d');

    ctx.drawImage(bg, 0, 0);

    let p = {
        t: { x: 126, y: 239 },
        b: { x: 144, y: 359 },
        l: { x: 72, y: 299 },
        r: { x: 191, y: 293 }
    };
    let cx = (p.l.x + p.r.x) / 2 + 2;
    let cy = (p.t.y + p.b.y) / 2;
    let r = (p.r.x - p.l.x) / 2;

    let s = Math.min(avatar.width, avatar.height);
    let sx = (avatar.width - s) / 2;
    let sy = (avatar.height - s) / 2;

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(avatar, sx, sy, s, s, cx - r, cy - r, r * 2, r * 2);
    ctx.restore();

    ctx.font = 'bold 48px "Nuninto", Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    ctx.fillText(name, cx + r + 19, cy);

    let left = 120, right = 1196, topY = 428, bottomY = 1549;
    let boxX = (left + right) / 2;
    let boxY = (topY + bottomY) / 2;

    function wrap(ctx, text, maxW) {
        let w = text.split(' '), line = '', lines = [];
        for (let i = 0; i < w.length; i++) {
            let t = line + w[i] + ' ';
            if (ctx.measureText(t).width > maxW && i > 0) {
                lines.push(line);
                line = w[i] + ' ';
            } else line = t;
        }
        lines.push(line);
        return lines;
    }

    let maxW = right - left;
    let maxH = bottomY - topY;
    let fsz = 74, lines, lh, th;
    
    do {
        ctx.font = `bold ${fsz}px "CooperBlack", Arial`;
        lines = wrap(ctx, text, maxW);
        lh = fsz * 1.1;
        th = lines.length * lh;
        fsz -= 2;
    } while ((th > maxH || Math.max(...lines.map(l => ctx.measureText(l).width)) > maxW) && fsz > 20);

    ctx.font = `bold ${fsz}px "CooperBlack", Arial`;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    let startY = boxY - (lines.length * lh / 2) + (lh / 2);
    lines.forEach((l, i) => ctx.fillText(l, boxX, startY + (i * lh)));

    return canvas.toBuffer('image/png');
}

class BALogo {
    constructor(options = {}) {
        this.fontSize = options.fontSize || 84;
        this.transparentBg = options.transparent || false;
        this.graphOffset = {
            X: options.haloX || -15,
            Y: options.haloY || 0
        };
        this.fontFamily = 'rog';
        this.font = `${this.fontSize}px "${this.fontFamily}"`;
        
        this.paddingX = 10;
        this.horizontalTilt = -0.4;
        this.textBaseLine = 0.68;
        this.canvasHeight = 250;
        this.canvasWidth = 900;
        
        this.hollowPath = [
            [284, 136],
            [321, 153],
            [159, 410],
            [148, 403]
        ];
    }

    async draw(textL, textR) {
        const font1Path = path.join(__dirname, '../media/font/ba-font1.otf');
        const font2Path = path.join(__dirname, '../media/font/ba-font2.otf');
        const haloPath = path.join(__dirname, '../media/ba-img1.png');
        const crossPath = path.join(__dirname, '../media/ba-img2.png');

        registerFont(font1Path, { family: 'rog' });
        registerFont(font2Path, { family: 'glow' });

        const halo = await loadImage(haloPath);
        const cross = await loadImage(crossPath);

        const canvas = createCanvas(this.canvasWidth, this.canvasHeight);
        const ctx = canvas.getContext('2d');
        ctx.font = this.font;

        const textMetricsL = ctx.measureText(textL);
        const textMetricsR = ctx.measureText(textR);

        const descentL = textMetricsL.actualBoundingBoxDescent || 0;
        const ascentR = textMetricsR.actualBoundingBoxAscent || this.fontSize;

        const textWidthL = textMetricsL.width - (this.textBaseLine * this.canvasHeight + descentL) * this.horizontalTilt;
        const textWidthR = textMetricsR.width + (this.textBaseLine * this.canvasHeight - ascentR) * this.horizontalTilt;

        const canvasWidthL = Math.max(this.canvasWidth / 2, textWidthL + this.paddingX);
        const canvasWidthR = Math.max(this.canvasWidth / 2, textWidthR + this.paddingX);

        const finalCanvas = createCanvas(canvasWidthL + canvasWidthR, this.canvasHeight);
        const ctxFinal = finalCanvas.getContext('2d');

        if (!this.transparentBg) {
            ctxFinal.fillStyle = '#ffffff';
            ctxFinal.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
        }

        const center = canvasWidthL;
        const y = finalCanvas.height * this.textBaseLine;

        ctxFinal.setTransform(1, 0, this.horizontalTilt, 1, 0, 0);
        ctxFinal.fillStyle = '#128AFA';
        ctxFinal.textAlign = 'end';
        ctxFinal.font = this.font;
        ctxFinal.fillText(textL, center, y);

        ctxFinal.setTransform(1, 0, 0, 1, 0, 0);

        const gx = center - this.canvasHeight / 2 + this.graphOffset.X;
        const gy = this.graphOffset.Y;
        ctxFinal.drawImage(halo, gx, gy, this.canvasHeight, this.canvasHeight);

        ctxFinal.setTransform(1, 0, this.horizontalTilt, 1, 0, 0);
        ctxFinal.textAlign = 'start';
        ctxFinal.lineWidth = 12;
        ctxFinal.strokeStyle = '#ffffff';
        ctxFinal.fillStyle = '#2B2B2B';
        ctxFinal.font = this.font;
        ctxFinal.strokeText(textR, center, y);
        ctxFinal.fillText(textR, center, y);

        ctxFinal.setTransform(1, 0, 0, 1, 0, 0);

        ctxFinal.beginPath();
        ctxFinal.moveTo(gx + (this.hollowPath[0][0] / 500) * this.canvasHeight, gy + (this.hollowPath[0][1] / 500) * this.canvasHeight);
        for (let i = 1; i < 4; i++) {
            ctxFinal.lineTo(gx + (this.hollowPath[i][0] / 500) * this.canvasHeight, gy + (this.hollowPath[i][1] / 500) * this.canvasHeight);
        }
        ctxFinal.closePath();
        ctxFinal.fillStyle = '#ffffff';
        ctxFinal.fill();

        ctxFinal.drawImage(cross, gx, gy, this.canvasHeight, this.canvasHeight);

        return finalCanvas.toBuffer('image/png');
    }
}

module.exports = { makeBrat, makeBratVid, makeQC, makeStoryIG, toSticker, addExif, BALogo };