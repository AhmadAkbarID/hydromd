export = Ship;

/**
 * @typedef {object} Ship
 * @see {Ship}
 * @example const shipCard = await new canvafy.Ship()
 * @type {Class}
 */
declare class Ship {
    data: CanvafyShipData;

    /**
     * .setAvatars
     * @param {string|Buffer|Image} image First Avatar
     * @param {string|Buffer|Image} image2 Second Avatar
     * @returns {Ship}
     * @example setAvatars("https://someone-image.png","https://someone-image.png")
     */
  setAvatars(image:string,image2:string):Ship;

    /**
     * .setBackground
     * @param {string} type "image" or "color"
     * @param {string|Buffer|Image} value "url" or "hexcolor"
     * @returns {Ship}
     * @example setBackground("image","https://someone-image.png")
     * @example setBackground("color","#000")
     */
  setBackground(type:"image"|"color", value:string):Ship;

  /**
   * .setBorder
   * @param {string} color "hexcolor"
   * @returns {Ship}
   * @example setBorder("#fff")
   */
  setBorder(color:string):Ship;


    /**
     * .setOverlayOpacity
     * @param {number} opacity must be between 0 and 1
     * @returns {Ship}
     * @example setOverlayOpacity(0.7)
     */
  setOverlayOpacity(opacity:number):Ship;

    /**
     * .setCustomNumber
     * @param {number} num must be between 0 and 100
     * @returns {Ship}
     * @example setCustomNumber(65)
     */
  setCustomNumber(num:number):Ship;


    build(): Promise<Buffer>;
}

declare namespace Ship { export { CanvafyShipData }; }

type CanvafyShipData = {
    avatar: "https://cdn.discordapp.com/embed/avatars/0.png";
    avatar2: "https://cdn.discordapp.com/embed/avatars/0.png";
    number: null;
    background: {
      type: "color",
      background: "#23272a"
    }
    overlay_opacity: 0;
    border:null;
};
//# sourceMappingURL=ship.d.ts.map
