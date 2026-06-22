export = Tweet;

/**
 * @typedef {object} Tweet
 * @see {Tweet}
 * @example const TweetCard = await new canvafy.Tweet()
 * @type {Class}
 */
declare class Tweet {
    data: CanvafyTweetData;

    /**
     * .setAvatar
     * @param {string} image Set User Avatar URL
     * @returns {Tweet}
     * @example setAvatar("https://someone-image.png")
     */
  setAvatar(image?:string):Tweet;


  /**
   * .setUser
   * @param {object} user {displayName: "string", username: "string"}
   * @returns {Tweet}
   * @example setUser({displayName: "Beş", username: "fivesobes"})
   */
  setUser({ displayName, username }:{displayName:string,username:string}):Tweet;


  /**
   * .setComment
   * @param {string} text Set User Comment
   * @returns {Tweet}
   * @example setComment("This is a tweet card. You can customize it as you wish. Enjoy! #Canvafy")
   */
  setComment(text?:string):Tweet;

  /**
   * .setTheme
   * @param {string} theme Set Theme
   * @returns {Tweet}
   * @example setTheme("dark")
   * @example setTheme("light")
   * @example setTheme("dim")
   * @throws {Error} Invalid theme
   */
  setTheme(theme:"dark"|"dim"|"light"):Tweet;

  /**
   * .setVerified
   * @param {boolean} verified Set Verified
   * @returns {Tweet}
   * @example setVerified(true)
   * @example setVerified(false)
   * @throws {Error} Verified must be a boolean
   */
  setVerified(verified:boolean):Tweet;


    build(): Promise<Buffer>;
}

declare namespace Tweet { export { CanvafyTweetData }; }

type CanvafyTweetData = {
    avatar: "https://cdn.discordapp.com/avatars/928259219038302258/299ebac2bc13f5a8f44d2dd1f0c9f856.png?size=1024";
    comment: "This is a tweet card. You can customize it as you wish. Enjoy! #Canvafy";
    verified: false;
    client: null;
    theme: "light";
    user: { displayName: "Beş", username: "fivesobes" };
};
//# sourceMappingURL=Tweet.d.ts.map
