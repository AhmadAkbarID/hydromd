"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const {otherImgs,otherBadges,nitroBadges,statusImgs,luppux} = require('../assets/images/profileFunc.json');
const badgesOrder = require('../plugins/badgesOrder.json');

/**
 * @typedef {object} Profile
 * @see {Profile}
 * @example const profileCard = await new canvafy.Profile()
 * @type {Class}
 */

module.exports = class Profile {
    constructor(options) {
        this.font = { name: options?.font?.name ?? "Poppins", path: options?.font?.path ?? `./assets/fonts/Poppins/Poppins-Regular.ttf` };
        this.userid = "928259219038302258",
        this.activity = {};
        this.border;
    }


    /**
     * .setBorder
     * @param {string} color "hexcolor"
     * @returns {Profile}
     * @example setBorder("#fff")
     */
  setBorder(color) {
    if (color) {
      if (/^#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/.test(color)) {
        this.border = color;
        return this;
      } else {
        throw new Error("Invalid color for the argument in the setBorder method. You must give a hexadecimal color.")
      }
    } else {
      throw new Error("You must give a hexadecimal color as the argument of setBorder method.");
    }
  }

    /**
     * .setActivity
     * @param {activity} activity someone discord user activity index [1]
     * @returns {Profile}
     * @example setActivity(user.presence,user.presence.largeImage)
     */
    setActivity({activity,largeImage}){
    this.activity = activity;
    this.largeImage = largeImage;
    return this;
    }

    /**
     * .setUser
     * @param {number} id someone discord user id
     * @returns {Profile}
     * @example setUser("Someone User ID")
     */
    setUser(id = 0) {
        if (id) {
            if(typeof id !== "string")throw new Error('You must add a parameter of String type setUser! Invalid user ID');
           // const userRegex = new RegExp(/^([0-9]{17,20})$/);
           // if (!userRegex.test(id)) throw new Error('Invalid user ID');
                this.userid = id;
                return this;
            } else {
                throw new Error("The setUser parameter cannot be left blank, please enter a user ID.");
            }
        }


    async build() {
        if (this.font.path) GlobalFonts.registerFromPath(this.font.path,this.font.name);

        const canvas = createCanvas(378, 536);
        const ctx = canvas.getContext("2d");
        let userData = await fetch(`https://japi.rest/discord/v1/user/${this.userid}`)
        let { data } = await userData.json();


        if(this.border){
        ctx.beginPath();
        ctx.lineWidth = 8;
        ctx.strokeStyle = this.border;
        ctx.moveTo(55, 15);
        ctx.lineTo(canvas.width - 55, 15);
        ctx.quadraticCurveTo(canvas.width - 20, 20, canvas.width - 15, 55);
        ctx.lineTo(canvas.width - 15, canvas.height - 55);
        ctx.quadraticCurveTo(canvas.width - 20, canvas.height - 20, canvas.width - 55, canvas.height - 15);
        ctx.lineTo(55, canvas.height - 15);
        ctx.quadraticCurveTo(20, canvas.height - 20, 15, canvas.height - 55);
        ctx.lineTo(15, 55);
        ctx.quadraticCurveTo(20, 20, 55, 15);
        ctx.lineTo(56, 15);
        ctx.stroke();
        ctx.closePath();
        }


        ctx.beginPath();
        ctx.moveTo(65, 25);
        ctx.lineTo(canvas.width - 65, 25);
        ctx.quadraticCurveTo(canvas.width - 25, 25, canvas.width - 25, 65);
        ctx.lineTo(canvas.width - 25, canvas.height - 65);
        ctx.quadraticCurveTo(canvas.width - 25, canvas.height - 25, canvas.width - 65, canvas.height - 25);
        ctx.lineTo(65, canvas.height - 25);
        ctx.quadraticCurveTo(25, canvas.height - 25, 25, canvas.height - 65);
        ctx.lineTo(25, 65);
        ctx.quadraticCurveTo(25, 25, 65, 25);
        ctx.lineTo(66, 25);
        ctx.clip();
        ctx.closePath();

        ctx.beginPath();
        ctx.globalAlpha = 1;
        ctx.fillStyle = "#232328";
        ctx.fillRect(0, 0, canvas.width - 5, canvas.height - 5)
        ctx.closePath();


        if (data?.bannerURL !== null) {
            let banner = `${data?.bannerURL}?size=512`
            try {
                ctx.drawImage(await loadImage(banner), 10, 10, 378, 140);
            } catch {
                ctx.beginPath();
                ctx.fillStyle = data?.banner_color;
                ctx.fillRect(10, 10, 378, 140);
                ctx.closePath();
            }

        } else {
            ctx.fillStyle = data?.banner_color;
            ctx.fillRect(10, 10, 378, 140);

        }



        let avatar = data?.avatarURL !== null ? `${data?.avatarURL}?size=512` : `${data?.defaultAvatarURL}?size=512`
        try {

            ctx.beginPath();
            ctx.globalAlpha = 1;
            ctx.fillStyle = "#111214";
            ctx.moveTo(75, 200);
            ctx.lineTo(canvas.width - 75, 200);
            ctx.quadraticCurveTo(canvas.width - 45, 200, canvas.width - 45, 200);
            ctx.lineTo(canvas.width - 45, 535 - 75);
            ctx.quadraticCurveTo(canvas.width - 45, 535 - 45, canvas.width - 75, 535 - 45);
            ctx.lineTo(75, 535 - 45);
            ctx.quadraticCurveTo(45, 535 - 45, 45, 535 - 75);
            ctx.lineTo(45, 200);
            ctx.quadraticCurveTo(200, 200, 75, 200);
            ctx.fill();

            let badges = [];
            let flagsUser = data?.public_flags_array.sort((a, b) => badgesOrder[b] - badgesOrder[a])
            if(["852800814808694814","379179073382907908","587564522009788426","136619876407050240","928259219038302258","341592492224806914","852103749228036136","331878061954039808","797096076330795018"].some(users => users == this.userid)) flagsUser.push('LUPPUX');

            for (let i = 0; i < flagsUser?.length; i++) {
             if(flagsUser[i].startsWith('LUPPUX')){
                const badge = await loadImage(
                  Buffer.from(otherImgs['luppux'], 'base64')
                );
                badges.push({ canvas: badge, x: 0, y: 165, w: 30 });
              }else if (flagsUser[i].startsWith('BOOSTER')) {
                  const badge = await loadImage(
                    Buffer.from(nitroBadges[flagsUser[i]], 'base64')
                  );
                  badges.push({ canvas: badge, x: 0, y: 165, w: 30 });
                } else if (flagsUser[i].startsWith('NITRO')) {
                  const badge = await loadImage(
                    Buffer.from(otherBadges[flagsUser[i]], 'base64')
                  );
                  badges.push({ canvas: badge, x: 0, y: 165, w: 30 });
                } else {
                  const badge = await loadImage(
                    Buffer.from(otherBadges[flagsUser[i]], 'base64')
                  );
                  badges.push({ canvas: badge, x: 0, y: 165, w: 30 });
                }
              }


            let x = 300;
            badges.forEach(async (badge) => {
            const { canvas, x:bX, y, w } = badge;
             ctx.drawImage(canvas, x + bX, y, w, w);
              x -= 30;
            });

            let globalNames = data?.global_name !== null ? data?.global_name : data?.username
            ctx.fillStyle = `WHITE`;
            ctx.font = `bold 20px "${this.font.name}"`;
            ctx.globalAlpha = 1;
            ctx.fillText(`${globalNames.length > 16 ? globalNames.slice(0,16)+"..." : globalNames}`, 65, 235)

            ctx.fillStyle = `WHITE`;
            ctx.font = `bold 14px "${this.font.name}"`;
            ctx.globalAlpha = 1;
            ctx.fillText(`DISCORD MEMBER SINCE`, 65, 420)

            const createdDateString = new Date(data?.createdTimestamp).toLocaleDateString('en',{ month: 'long', day: 'numeric', year: 'numeric' });
            ctx.fillStyle = `WHITE`;
            ctx.font = `normal 12px "${this.font.name}"`;
            ctx.globalAlpha = 1;
            ctx.fillText(`${createdDateString}`, 65, 445)

            ctx.fillStyle = `WHITE`;
            ctx.font = `normal 15px "${this.font.name}"`;
            ctx.globalAlpha = 1;
            ctx.fillText(`${data?.username.length > 18 ? data?.username.slice(0,18)+"..." : data?.username}`, 65, 255)

            if(this.activity && this.activity.name){
                ctx.fillStyle = `WHITE`;
                ctx.font = `bold 12px "${this.font.name}"`;
                ctx.globalAlpha = 1;
                ctx.fillText(`${this.activity.type == 0 ? "PLAYING A GAME" : this.activity.type == 2 ? `LISTENING TO ${this.activity.name.length > 8 ? this.activity.name.slice(0,11) : this.activity.name}` : this.activity.type == 3 ? `WATCHING ${this.activity.name.length > 8 ? this.activity.name.slice(0,11) : this.activity.name}`: this.activity.type == 1 ? `LIVE ON STREAM` : "PLAYING A GAME"}`, 65, 310)

                ctx.fillStyle = `WHITE`;
                ctx.font = `bold 10px "${this.font.name}"`;
                ctx.globalAlpha = 1;
                ctx.fillText(`${this.activity.name !== null ? this.activity.name : "Anything"}`, 110, 333)

                ctx.fillStyle = `WHITE`;
                ctx.font = `normal 10px "${this.font.name}"`;
                ctx.globalAlpha = 1;
                ctx.fillText(`${this.activity.details !== null ? `${this.activity.details}` : ""}`, 110, 345)

                ctx.fillStyle = `WHITE`;
                ctx.font = `normal 10px "${this.font.name}"`;
                ctx.globalAlpha = 1;
                ctx.fillText(`${this.activity.state !== null ? `${this.activity.state}` : ""}`, 110, 358)

                try {
                ctx.drawImage(await loadImage(this.activity.assets !== null ? this.largeImage !== null ? this.largeImage :"https://cdn.discordapp.com/attachments/1106235099743264768/1109156957182505010/2023-05-19_19-33-08.png" : "https://cdn.discordapp.com/attachments/1106235099743264768/1109156957182505010/2023-05-19_19-33-08.png"), 60, 320, 45, 45);
                } catch (error) {
                ctx.drawImage(await loadImage("https://cdn.discordapp.com/attachments/1106235099743264768/1109156957182505010/2023-05-19_19-33-08.png"), 60, 320, 45, 45);
                }
                }

            ctx.globalAlpha = 1;
            ctx.lineWidth = 12;
            ctx.strokeStyle = "#232328";
            ctx.arc(90, 120, 55, 0, Math.PI * 2);
            ctx.stroke();
            ctx.closePath();
            ctx.beginPath();
            ctx.fill()
            ctx.lineWidth = 8;
            ctx.arc(90, 120, 50, 0, 2 * Math.PI);
            ctx.clip();
            ctx.drawImage(await loadImage(avatar), 40, 70, 100, 100);
            ctx.closePath();


        } catch(err) {

        }




        return canvas.toBuffer('image/png');
    }
};
