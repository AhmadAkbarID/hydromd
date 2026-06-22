export = Rank;

/**
 * @typedef {object} Rank
 * @see {Rank}
 * @example const rankCard = await new canvafy.Rank()
 * @type {Class}
 */
declare class Rank {
    data: CanvafyRankData;

      /**
     * .setUsername
     * @param {string} username User Username
     * @param {string} color Username Text Color "hexcolor"
     * @returns {Rank}
     * @example setUsername("fivesobes")
     * @example setUsername("fivesobes","#fff")
     */
    setUsername(name: string, color?: string): Rank;

    /**
     * .setAvatar
     * @param {string} image Set User Avatar URL
     * @returns {Rank}
     * @example setAvatar("https://someone-image.png")
     */
    setAvatar(data: string | Buffer): Rank;

    /**
     * .setBackground
     * @param {string} type "image" or "color"
     * @param {string|Buffer|Image} value "url" or "hexcolor"
     * @returns {Rank}
     * @example setBackground("image","https://someone-image.png")
     * @example setBackground("color","#000")
     */
    setBackground(type:"image"|"color",value:string|Buffer):Rank;

    /**
   * .setBarColor
   * @param {string} color "hexcolor"
   * @returns {Rank}
   * @example setBarColor("#ff0000")
   */
    setBarColor(color?:string):Rank;

     /**
     * .setBorder
     * @param {string} color "hexcolor"
     * @returns {Rank}
     * @example setBorder("#f0f0f0")
     */
    setBorder(color?:string):Rank;

     /**
     * .setOverlayOpacity
     * @param {number} opacity must be between 0 and 1
     * @returns {Rank}
     * @example setOverlayOpacity(0.5)
     */
    setOverlayOpacity(opac?:number):Rank;

    /**
     * .setLevel
     * @param {number} data Level Number
     * @param {string} text Level Text (Option)
     * @returns {Rank}
     * @example setLevel(2)
     * @example setLevel(2,"Level")
     */
    setLevel(level:number,text?:string):Rank;

    /**
     * .setLevelColor
     * @param {string} text Level Text Color "hexcolor"
     * @param {string} number Level Number Color "hexcolor"
     * @returns {Rank}
     * @example setLevelColor({text:"#fff",number:"#fff"})
     */
    setLevelColor(text?:string,level?:string):Rank;

    /**
     * .setRank
     * @param {number} data Rank Number
     * @param {string} text Rank Text (Option)
     * @returns {Rank}
     * @example setRank(2)
     * @example setRank(2,"Rank")
     */
    setRank(rank:number,text?:string):Rank;

    /**
     * .setRankColor
     * @param {string} text Rank Text Color "hexcolor"
     * @param {string} number Rank Number Color "hexcolor"
     * @returns {Rank}
     * @example setRankColor({text:"#fff",number:"#fff"})
     */
    setRankColor(text?:string,level?:string):Rank;

    /**
     * .setCurrentXp
     * @param {number} xp User Current Xp Number
     * @param {string} color Current Xp Text Color "hexcolor"
     * @returns {Rank}
     * @example setCurrentXp(100)
     * @example setCurrentXp(100,"#000")
     */
    setCurrentXp(xp:number,color?:string):Rank;

     /**
     * .setRequiredXp
     * @param {number} xp User Required Xp Number
     * @param {string} color Required Xp Text Color "hexcolor"
     * @returns {Rank}
     * @example setRequiredXp(300)
     * @example setRequiredXp(300,"#000")
     */
    setRequiredXp(xp:number,color?:string):Rank;

    /**
     * .setStatus
     * @param {string} status User Status "dnd","idle","online","offline","stream"
     * @returns {Rank}
     * @example setStatus("dnd")
     */
    setStatus(status: "online"|"dnd"|"idle"|"stream"|"offline"):Rank;

     /**
     * .setCustomStatus
     * @param {string} color User Status Custom Color "hexcolor"
     * @returns {Rank}
     * @example setCustomStatus("#ff0000")
     */
    setCustomStatus(color: string): Rank;
    build(): Promise<Buffer>;
}

declare namespace Rank { export { CanvafyRankData }; }

type CanvafyRankData = {
    avatar: "https://cdn.discordapp.com/embed/avatars/0.png";
    overlay_opacity: 0.5;
    background: {
      type: "color",
      background: "#23272a"
    };
    bar: {
      color: "#ff000"
    };
    username: {
      data: "fivesobes",
      color: "#fff",
      size: 28
    };
    level: {
      data: 1,
      display: false,
      text: "Level",
      text_color: "#fff",
      number_color: "#fff",
      size: 20,
      data_size: 40
    };
    rank: {
      data: 1,
      display: false,
      text: "Rank",
      text_color: "#fff",
      number_color: "#fff",
      size: 20,
      data_size: 40
    };
    current_xp: {
      data: 0,
      color: "#000"
    };
    required_xp: {
      data: 0,
      color: "#000"
    };
    status: null;
    border: null;
};
//# sourceMappingURL=rank.d.ts.map
