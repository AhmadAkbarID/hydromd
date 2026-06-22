export = Instagram;

/**
 * @typedef {object} Instagram
 * @see {Instagram}
 * @example const InstagramCard = await new canvafy.Instagram()
 * @type {Class}
 */
declare class Instagram {
    data: CanvafyInstagramData;

    /**
     * .setAvatar
     * @param {string} image Set User Avatar URL
     * @returns {Instagram}
     * @example setAvatar("https://someone-image.png")
     */
    setAvatar(image?:string):Instagram;


    /**
     * .setUser
     * @param {object} user {username: "string"}
     * @returns {Instagram}
     * @example setUser({username: "fivesobes"})
     * @example setUser({username: "_berknt"})
     */
    setUser({ username }:{username:string}):Instagram;


    /**
     * .setLike
     * @param {object} like {count: number, likeText: string}
     * @returns {Instagram}
     * @example setLike({count: 1200, likeText: "like"})
     */
    setLike({ count, likeText }:{count:number,likeText:string}):Instagram;


    /**
     * .setVerified
     * @param {boolean} verified Set Verified
     * @returns {Instagram}
     * @example setVerified(true)
     * @example setVerified(false)
     * @throws {Error} Verified must be a boolean
     */
    setVerified(verified:boolean):Instagram;


    /**
     * .setStory
     * @param {boolean} story Set Story
     * @returns {Instagram}
     * @example setStory(true)
     * @example setStory(false)
     * @throws {Error} Story must be a boolean
     */
    setStory(story:boolean):Instagram;


    /**
     * .setPostDate
     * @param {number} date Set Post Date
     * @returns {Instagram}
     * @example setPostDate(Date.now() - 1000 * 60 * 60 * 24 * 2)
     */
    setPostDate(date:number):Instagram;


    /**
     * .setPostImage
     * @param {string} image Set Post Image URL
     * @returns {Instagram}
     * @example setPostImage("https://someoneimage.png")
     */
    setPostImage(image:string):Instagram;


    /**
     * .setLiked
     * @param {boolean} liked Set Liked
     * @returns {Instagram}
     * @example setLiked(true)
     * @example setLiked(false)
     * @throws {Error} Liked must be a boolean
     */
    setLiked(liked:boolean):Instagram;


    /**
     * .setSaved
     * @param {boolean} saved Set Saved
     * @returns {Instagram}
     * @example setSaved(true)
     * @example setSaved(false)
     * @throws {Error} Saved must be a boolean
     */
    setSaved(saved:boolean):Instagram;

    /**
     * .setTheme
     * @param {string} theme Set Theme
     * @returns {Instagram}
     * @example setTheme("dark")
     * @example setTheme("light")
     * @throws {Error} Invalid theme
     */
    setTheme(theme:"dark"|"light"):Instagram;


    build(): Promise<Buffer>;
}

declare namespace Instagram { export { CanvafyInstagramData }; }

type CanvafyInstagramData = {
    avatar: "https://cdn.discordapp.com/avatars/928259219038302258/299ebac2bc13f5a8f44d2dd1f0c9f856.png?size=1024";
    verified: true;
    theme: "dark";
    user: { username: "fivesobes" };
    like: { likeCount: 5, likeText: "likes" };
    image: "https://cdn.discordapp.com/avatars/928259219038302258/299ebac2bc13f5a8f44d2dd1f0c9f856.png?size=1024";
    postDate: 5000;
    isSaved: true;
    isLiked: true;
    story: true;
};
//# sourceMappingURL=Instagram.d.ts.map
