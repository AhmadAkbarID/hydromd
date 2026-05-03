const crypto = require('crypto');

async function mathgpt({ question, think = false, image = null, mime = null, ext = 'jpg' } = {}) {
  try {
    if (!question) throw new Error('Question is required.')
    
    const ip = [10, crypto.randomInt(256), crypto.randomInt(256), crypto.randomInt(256)].join('.')
    
    const headers = {
      'accept': 'application/json',
      'accept-language': 'id-ID',
      'content-type': 'application/json',
      'origin': 'https://math-gpt.ai',
      'priority': 'u=1, i',
      'referer': 'https://math-gpt.ai/',
      'sec-ch-ua': '"Chromium";v="127", "Not)A;Brand";v="99"',
      'sec-ch-ua-mobile': '?1',
      'sec-ch-ua-platform': '"Android"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Mobile Safari/537.36',
      'x-forwarded-for': ip,
      'x-originating-ip': ip,
      'x-remote-ip': ip,
      'x-remote-addr': ip,
      'x-forwarded-host': ip,
      'x-connecting-ip': ip,
      'client-ip': ip,
      'x-client-ip': ip,
      'x-real-ip': ip,
      'x-forwarded-for-original': ip,
      'x-forwarded': ip,
      'x-cluster-client-ip': ip,
      'x-original-forwarded-for': ip
    }
    
    let fileDetails = null
    
    if (image && mime && mime.startsWith('image/')) {
      try {
        const filePath = `chat/${crypto.randomBytes(32).toString('hex')}.${ext}`
        
        const upRes = await fetch('https://math-gpt.ai/api/trpc/uploads.signedUploadUrl?batch=1', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            0: {
              json: {
                path: filePath,
                bucket: 'mathgpt'
              }
            }
          })
        })
        
        const up = await upRes.json()
        
        await fetch(up[0].result.data.json, {
          method: 'PUT',
          headers: {
            'content-type': mime
          },
          body: image
        })
        
        fileDetails = {
          fileUrl: `https://files.math-gpt.ai/${filePath}`,
          mimeType: mime,
          fileName: `image-${Date.now()}.${ext}`
        }
      } catch (e) {
          console.error("Gagal mengupload gambar ke mathgpt:", e);
      }
    }
    
    const res = await fetch('https://math-gpt.ai/api/ai/generateAnswerStream', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        messages: [{
          id: Date.now(),
          text: question,
          sender: 'user',
          ...(fileDetails || {})
        }],
        type: 'MathAI',
        isJustAnswerEnabled: false,
        isThinkingEnabled: think,
        visitorId: crypto.randomUUID().replace(/-/g, '')
      })
    })
    
    const text = await res.text()
    
    const result = text
      .split('\n\n')
      .filter(line => line.startsWith('data: {'))
      .map(line => JSON.parse(line.substring(6)))
      .find(line => line.type === 'end')
    
    if (!result) throw new Error('Tidak ada respon yang diterima dari AI.')
    
    return result
  } catch (error) {
    throw new Error(error.message)
  }
}

module.exports = { mathgpt };