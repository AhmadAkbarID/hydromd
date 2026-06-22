export = Profile;

/**
 * @typedef {object} Profile
 * @see {Profile}
 * @example const ProfileCard = await new canvafy.Profile()
 * @type {Class}
 */
declare class Profile {
    data: CanvafyProfileData;

     /**
     * .setBorder
     * @param {string} color "hexcolor"
     * @returns {Profile}
     * @example setBorder("#fff")
     */
 setBorder(color:string):Profile;

    /**
     * .setActivity
     * @param {activity} activity someone discord user activity index [1]
     * @returns {Profile}
     * @example setActivity(user.presence,user.presence.largeImage)
     */
    setActivity({activity:{},largeImage:{}}):Profile;

    /**
     * .setUser
     * @param {number} id someone discord user id
     * @returns {Profile}
     * @example setUser("Someone User ID")
     */
    setUser(id:string):Profile;


    build(): Promise<Buffer>;
}

declare namespace Profile { export { CanvafyProfileData }; }

type CanvafyProfileData = {
    userid: "928259219038302258",
    activity: {};
    border:null;
};
//# sourceMappingURL=profile.d.ts.map