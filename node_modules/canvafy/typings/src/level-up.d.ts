export = LevelUp;

/**
 * @typedef {object} LevelUp
 * @see {LevelUp}
 * @example const LevelUpCard = await new canvafy.LevelUp()
 * @type {Class}
 */
declare class LevelUp {
    data: CanvafyLevelUpData;

   /**
     * .setAvatar
     * @param {string} image Set User Avatar URL
     * @returns {LevelUp}
     * @example setAvatar("https://someone-image.png")
     */
   setAvatar(image:string):LevelUp;

  /**
     * .setAvatarBorder
     * @param {string} color Set Avatar Avatar Border Color
     * @returns {LevelUp}
     * @example setAvatarBorder("#fff")
     */
  setAvatarBorder(color:string):LevelUp;


  /**
     * .setBackground
     * @param {string} type "image" or "color"
     * @param {string|Buffer|Image} value "url" or "hexcolor"
     * @returns {LevelUp}
     * @example setBackground("image","https://someone-image.png")
     * @example setBackground("color","#000")
     */
  setBackground(type:"image"|"color", value:string):LevelUp;

  /**
     * .setBorder
     * @param {string} color "hexcolor"
     * @returns {LevelUp}
     * @example setBorder("#fff")
     */
  setBorder(color:string):LevelUp;


  /**
     * .setRank
     * @param {number} oldLevel Old Level Number
     * @param {number} newLevel New Level Number
     * @returns {LevelUp}
     * @example setLevels(5,6)
     */
  setLevels(oldLevel:number, newLevel:number):LevelUp;

    /**
     * .setOverlayOpacity
     * @param {number} opacity must be between 0 and 1
     * @returns {LevelUp}
     * @example setOverlayOpacity(0.7)
     */
  setOverlayOpacity(opacity:number):LevelUp;

  /**
     * .setUsername
     * @param {string} text Username
     * @param {string} color "hexcolor"
     * @returns {LevelUp}
     * @example setUsername("fivesobes")
     * @example setUsername("fivesobes","#ff0000")
     */
  setUsername(text:string, color?:string):LevelUp;


    build(): Promise<Buffer>;
}

declare namespace LevelUp { export { CanvafyLevelUpData }; }

type CanvafyLevelUpData = {
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
    levels: {
      oldLevel: 0,
      newLevel: 1
    }
    border:null;
    avatar_border: "#2a2e35";
};
//# sourceMappingURL=level-up.d.ts.map
