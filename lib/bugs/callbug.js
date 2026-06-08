// callfc.js
async function AplynCallnode(hydro, target) {
const crypto = require("crypto");
const {
jidEncode,
jidDecode,
encodeWAMessage,
patchMessageBeforeSending,
encodeNewsletterMessage,
encodeSignedDeviceIdentity
} = require("@whiskeysockets/baileys");

const ctx = {  
    jidEncode,  
    jidDecode,  
    encodeWAMessage,  
    patchMessageBeforeSending,  
    encodeNewsletterMessage  
};  
let dev = await hydro.getUSyncDevices([target], false, false);  
let rec = dev.map(d => `${d.user}:${d.device || ''}@s.whatsapp.net`);  
await hydro.assertSessions(rec);  
let sync = (() => {  
    let map = {};  
    return {  
        lock(id, fn) {  
            map[id] ??= Promise.resolve();  
            map[id] = (async () => {  
                await map[id];  
                return fn();  
            })();  
            return map[id];  
        }  
    };  
})();  

let wrap = buf => Buffer.concat([Buffer.from(buf), Buffer.alloc(8, 1)]);  

let origCreate = hydro.createParticipantNodes?.bind(ctx);  
let origEncode = hydro.encodeWAMessage?.bind(ctx);  

hydro.createParticipantNodes = async (targets, msg, attrs, dsm) => {  
    let patched = await (hydro.patchMessageBeforeSending?.(msg, targets) ?? msg);  

    let blocks = Array.isArray(patched)  
        ? patched  
        : targets.map(j => ({ jid: j, message: patched }));  

    let includeId = false;  

    let nodes = await Promise.all(  
        blocks.map(async ({ jid, message }) => {  
            let coded = origEncode  
                ? origEncode(message)  
                : encodeWAMessage(message);  

            let payload = wrap(coded);  

            return sync.lock(jid, async () => {  
                let enc = await hydro.signalRepository.encryptMessage({  
                    jid,  
                    data: payload  
                });  

                if (enc.type === "pkmsg") includeId = true;  

                return {  
                    tag: "to",  
                    attrs: { jid },  
                    content: [{  
                        tag: "enc",  
                        attrs: { v: "2", type: enc.type },  
                        content: enc.ciphertext  
                    }]  
                };  
            });  
        })  
    );  

    return {  
        nodes,  
        shouldIncludeDeviceIdentity: includeId  
    };  
};  

let { nodes: route, shouldIncludeDeviceIdentity } =  
    await hydro.createParticipantNodes(  
        rec,  
        { conversation: "Y" },  
        { count: "0" }  
    );  

let callNode = {  
    tag: "call",  
    attrs: {  
        to: target,  
        id: hydro.generateMessageTag(),  
        from: hydro.user.id  
    },  
    content: [  
        {  
            tag: "offer",  
            attrs: {  
                "call-id": crypto.randomBytes(16).toString("hex").toUpperCase(),  
                "call-creator": hydro.user.id  
            },  
            content: [  
                { tag: "audio", attrs: { enc: "opus", rate: "16000" } },  
                { tag: "audio", attrs: { enc: "opus", rate: "8000" } },  
                {  
                    tag: "video",  
                    attrs: {  
                        enc: "vp8",  
                        dec: "vp8",  
                        screen_width: "1920",  
                        screen_height: "1080",  
                        orientation: "0"  
                    }  
                },  
                { tag: "net", attrs: { medium: "3" } },  
                { tag: "capability", attrs: { ver: "1" }, content: new Uint8Array([1, 7, 230]) },  
                { tag: "encopt", attrs: { keygen: "2" } },  
                { tag: "destination", attrs: {}, content: route },  
                shouldIncludeDeviceIdentity  
                    ? {  
                        tag: "device-identity",  
                        attrs: {},  
                        content: encodeSignedDeviceIdentity(  
                            hydro.authState.creds.account,   
                            true  
                        )  
                    }  
                    : null  
            ].filter(Boolean)  
        }  
    ]  
};  

await hydro.sendNode(callNode);

}

module.exports = { AplynCallnode };