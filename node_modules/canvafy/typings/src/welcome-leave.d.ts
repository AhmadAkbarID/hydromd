export = WelcomeLeave;

/**
 * @typedef {object} WelcomeLeave
 * @see {WelcomeLeave}
 * @example const welcomeLeaveCard = await new canvafy.WelcomeLeave()
 * @type {Class}
 */
declare class WelcomeLeave {
    data: CanvafyWelcomeLeaveData;


    /**
     * .setAvatarBorder
     * @param {string} color Set Avatar Avatar Border Color
     * @returns {WelcomeLeave}
     * @example setAvatarBorder("#fff")
     */
    setAvatarBorder(color:string):WelcomeLeave;

      /**
     * .setUsername
     * @param {string} username User Username
     * @param {string} color Username Text Color "hexcolor"
     * @returns {WelcomeLeave}
     * @example setUsername("fivesobes")
     * @example setUsername("fivesobes","#fff")
     */
    setUsername(name: string, color?: string): WelcomeLeave;

    /**
     * .setAvatar
     * @param {string} image Set User Avatar URL
     * @returns {WelcomeLeave}
     * @example setAvatar("https://someone-image.png")
     */
    setAvatar(data: string | Buffer): WelcomeLeave;

    /**
     * .setBackground
     * @param {string} type "image" or "color"
     * @param {string|Buffer|Image} value "url" or "hexcolor"
     * @returns {WelcomeLeave}
     * @example setBackground("image","https://someone-image.png")
     * @example setBackground("color","#000")
     */
    setBackground(type:"image"|"color",value:string|Buffer):WelcomeLeave;

     /**
     * .setBorder
     * @param {string} color "hexcolor"
     * @returns {WelcomeLeave}
     * @example setBorder("#f0f0f0")
     */
    setBorder(color?:string):WelcomeLeave;

     /**
     * .setOverlayOpacity
     * @param {number} opacity must be between 0 and 1
     * @returns {WelcomeLeave}
     * @example setOverlayOpacity(0.5)
     */
    setOverlayOpacity(opac?:number):WelcomeLeave;

     /**
     * .setDescription
     * @param {string} text Description
     * @param {string} color "hexcolor"
     * @returns {WelcomeLeave}
     * @example setDescription("Welcome to Server.")
     */
    setDescription(text:string,color?:string):WelcomeLeave;

    /**
     * .setTitle
     * @param {string} text Title
     * @param {string} color "hexcolor"
     * @returns {WelcomeLeave}
     * @example setTitle("fivesobes")
     */
   setTitle(text:string, color?:string):WelcomeLeave;


    build(): Promise<Buffer>;
}

declare namespace WelcomeLeave { export { CanvafyWelcomeLeaveData }; }

type CanvafyWelcomeLeaveData = {
    avatar: "https://cdn.discordapp.com/embed/avatars/0.png";
    background: {
      type: "color",
      background: "#23272a"
    };
    title: {
      data: "Welcome",
      color: "#fff",
      size: 36
    };
    description: {
      data: "Welcome to this server, go read the rules please!",
      color: "#a7b9c5",
      size: 26
    };
    overlay_opacity: 0;
    border:null;
    avatar_border: "#2a2e35";
};
//# sourceMappingURL=welcome-leave.d.ts.map
