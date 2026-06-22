export = Top;

/**
 * @typedef {object} Top
 * @see {Top}
 * @example const leaderBoardCard = await new canvafy.Top()
 * @type {Class}
 */
declare class Top {
    data: CanvafyTopData;

/**
     * .setUsersData
     * @param {object[]} usersData [{ top: int, avatar: "string", tag: "string", score: int}]
     * @returns {Top}
     * @example setUsersData([{top:1,avatar:"https://someone-image.png",tag:"fivesobes",score:5}])
     */
setUsersData(usersData:object[]):Top;

    /**
     * .setScoreMessage
     * @param {string} message Set Custom Score Message
     * @returns {Top}
     * @example setScoreMessage("Message")
     */
   setScoreMessage(message:string):Top;


   /**
     * .setColors
     * @param {object} colors {box: "hexcolor", username: "hexcolor", score: "hexcolor", firstRank: "hexcolor", secondRank: "hexcolor", thirdRank: "hexcolor"}
     * @returns {Top}
     * @example setColors({ box: '#212121', username: '#ffffff', score: '#ffffff', firstRank: '#f7c716', secondRank: '#9e9e9e', thirdRank: '#94610f' })
     */
  setColors(colors:object|{}):Top;

   /**
     * .setabbreviateNumber
     * @param {boolean} bool must be "true" or "false"
     * @returns {Top}
     * @example setabbreviateNumber(true)
     */
 setabbreviateNumber(bool:boolean):Top;

    /**
     * .setOpacity
     * @param {number} opacity must be between 0 and 1
     * @returns {Top}
     * @example setOpacity(0.6)
     */
 setOpacity(opacity:number):Top;

  /**
     * .setBackground
     * @param {string} type "image" or "color"
     * @param {string} value "url" or "hexcolor"
     * @returns {Top}
     * @example setBackground("image","https://someone-image.png")
     * @example setBackground("color","#000")
     */
  setBackground(type:"image"|"color", value:string):Top;

    build(): Promise<Buffer>;
}

declare namespace Top { export { CanvafyTopData }; }

type CanvafyTopData = {
    usersData:[{ top: 1, avatar: "https://i.pinimg.com/736x/c6/a8/5f/c6a85f7dbcbf367d5dc1baa2aaa19a73.jpg", tag: "Beş#0005", score: 5 },{ top: 2, avatar: "https://i.pinimg.com/736x/c6/a8/5f/c6a85f7dbcbf367d5dc1baa2aaa19a73.jpg", tag: "Beş#0005", score: 5 },{ top: 3, avatar: "https://i.pinimg.com/736x/c6/a8/5f/c6a85f7dbcbf367d5dc1baa2aaa19a73.jpg", tag: "Beş#0005", score: 5 }];
    background: {
      type: "none",
      background: "none"
    };
    abbreviateNumber: false;
    opacity: 0;
    scoreMessage: "";
    colors: { box: '#212121', username: '#ffffff', score: '#ffffff', firstRank: '#f7c716', secondRank: '#9e9e9e', thirdRank: '#94610f' };
};
//# sourceMappingURL=top.d.ts.map
