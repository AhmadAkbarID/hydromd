export = Security;

/**
 * @typedef {object} Security
 * @see {Security}
 * @example const SecurityCard = await new canvafy.Security()
 * @type {Class}
 */
declare class Security {
    data: CanvafySecurityData;

    /**
     * .setAvatar
     * @param {string} image Set User Avatar URL
     * @returns {Security}
     * @example setAvatar("https://someone-image.png")
     */
  setAvatar(image:string):Security;

  /**
     * .setAvatarBorder
     * @param {string} color Set Avatar Avatar Border Color
     * @returns {Security}
     * @example setAvatarBorder("#fff")
     */
  setAvatarBorder(color:string):Security;


    /**
     * .setLocale
     * @param {string} lang someone language code
     * @returns {Security}
     * @example setLocale("en")
     * @example setLocale("fr")
     */
    setLocale(lang:string):Security;


     /**
     * .setCreatedTimestamp
     * @param {number} time someone discord user createdtimestamp
     * @returns {Security}
     * @example setCreatedTimestamp(someoneUser.createdTimestamp)
     */
   setCreatedTimestamp(time:number):Security;

    /**
     * .setSuspectTimestamp
     * @param {number} time period of time to be considered suspect
     * @returns {Security}
     * @example setSuspectTimestamp(604800000)
     * @example setSuspectTimestamp(someoneMsTime)
     */
   setSuspectTimestamp(time:number):Security;


  /**
     * .setBackground
     * @param {string} type "image" or "color"
     * @param {string|Buffer|Image} value "url" or "hexcolor"
     * @returns {Security}
     * @example setBackground("image","https://someone-image.png")
     * @example setBackground("color","#000")
     */
  setBackground(type:"image"|"color", value?:string):Security;


  /**
     * .setBorder
     * @param {string} color "hexcolor"
     * @returns {Security}
     * @example setBorder("#fff")
     */
  setBorder(color:string):Security;

    /**
     * .setOverlayOpacity
     * @param {number} opacity must be between 0 and 1
     * @returns {Security}
     * @example setOverlayOpacity(0.7)
     */
  setOverlayOpacity(opacity:number):Security;


    build(): Promise<Buffer>;
}

declare namespace Security { export { CanvafySecurityData }; }

type CanvafySecurityData = {
    avatar: "https://cdn.discordapp.com/embed/avatars/0.png";
    userid:null;
    control:null;
    locale: "en";
    createdtime:null;
    suspecttime:null;
    background: {
      type: "color",
      background: "#23272a"
    };
    overlay_opacity: 0;
    border:null;
    avatar_border: "#2a2e35";
};
//# sourceMappingURL=security.d.ts.map
