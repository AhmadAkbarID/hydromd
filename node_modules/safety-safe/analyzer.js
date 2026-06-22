function analyzeMessage(message) {
  if (!message) {
    return { isMalicious: false, reason: null };
  }

  const fullText = message.conversation || message.extendedTextMessage?.text || message.imageMessage?.caption || message.videoMessage?.caption || '';
  if (fullText.length > 25000) {
    return { isMalicious: true, reason: 'Extreme text length' };
  }
  
  const invisibleCharRegex = /[\u200b-\u200f\u202a-\u202e\uFEFF]/g;
  const invisibleCharCount = (fullText.match(invisibleCharRegex) || []).length;
  if (invisibleCharCount > 5000 && fullText.length > 0 && (invisibleCharCount / fullText.length > 0.5)) {
    return { isMalicious: true, reason: 'High density of invisible characters' };
  }

  const contextInfo = message.stickerMessage?.contextInfo || message.imageMessage?.contextInfo || message.videoMessage?.contextInfo || 
                      message.audioMessage?.contextInfo || message.documentMessage?.contextInfo || message.extendedTextMessage?.contextInfo ||
                      message.interactiveMessage?.contextInfo || message.buttonsMessage?.contextInfo || message.listMessage?.contextInfo;
  
  const mediaMsg = message.documentMessage || message.videoMessage || message.imageMessage || message.audioMessage;
  
  if (contextInfo?.mentionedJid?.length > 1000) {
    return { isMalicious: true, reason: 'Massive mention count' };
  }
  
  if (message.protocolMessage?.type === 29 || message.protocolMessage?.type === 25) {
    return { isMalicious: true, reason: 'Unusual Protocol Message type detected' };
  }
  
  if (message.albumMessage?.messageList?.length > 50) {
    return { isMalicious: true, reason: 'Forbidden: albumMessage with excessive items' };
  }

  if (mediaMsg) {
    const duration = mediaMsg.seconds || 0;
    const fileLength = parseInt(mediaMsg.fileLength || '0', 10);
    const pageCount = mediaMsg.pageCount || 0;
    if (duration > 3600 || fileLength > 2000000000 || pageCount > 1000000 || duration > 9999999 || fileLength > 9999999999) {
      return { isMalicious: true, reason: 'Bug: Media with unreasonable properties' };
    }
  }

  if (mediaMsg?.externalAdReply) {
    const titleLength = mediaMsg.externalAdReply.title?.length || 0;
    const bodyLength = mediaMsg.externalAdReply.body?.length || 0;
    if (titleLength > 5000 || bodyLength > 5000) {
      return { isMalicious: true, reason: 'Bug: externalAdReply with oversized text' };
    }
  }

  if (message.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson?.length > 10000) {
    return { isMalicious: true, reason: 'Bug: Interactive Response with oversized paramsJson' };
  }

  if (message.videoMessage?.annotations) {
    for (const annotation of message.videoMessage.annotations) {
      const authorLength = annotation.embeddedContent?.embeddedMusic?.author?.length || 0;
      if (authorLength > 5000) {
        return { isMalicious: true, reason: 'Bug: Video Annotations' };
      }
    }
  }

  const listMessageSections = message.listResponseMessage?.sections || message.listMessage?.sections;
  if (listMessageSections?.[0]?.rows?.length > 1000) {
    return { isMalicious: true, reason: 'Bug: List message with excessive rows' };
  }
  const buttonCount = message.buttonsMessage?.buttons?.length || message.interactiveMessage?.nativeFlowMessage?.buttons?.length || 0;
  if (buttonCount > 100) {
      return { isMalicious: true, reason: 'Bug: Message with excessive buttons'};
  }
  
  if (message.locationMessage?.comment?.length > 5000 || 
      message.contactMessage?.displayName?.length > 5000 ||
      message.liveLocationMessage?.sequenceNumber > 999999999 ||
      message.productMessage?.product?.productImageCount > 100 ||
      message.orderMessage?.itemCount > 1000) {
    return { isMalicious: true, reason: 'Bug: Payload with abnormal specific properties' };
  }
  
  if (message.nativeFlowResponseMessage?.resultado) {
    try {
      if (JSON.parse(message.nativeFlowResponseMessage.resultado)?.ws?.config?.waWebSocketUrl) {
        return { isMalicious: true, reason: 'Bug: Fake Pairing Code' };
      }
    } catch (e) { }
  }

  return { isMalicious: false, reason: null };
}

module.exports = { analyzeMessage };
