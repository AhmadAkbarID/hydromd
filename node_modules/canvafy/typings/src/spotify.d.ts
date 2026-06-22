export = Spotify;

/**
 * @typedef {object} Spotify
 * @see {Spotify}
 * @example const spotifyCard = await new canvafy.Spotify()
 * @type {Class}
 */
declare class Spotify {
    data: CanvafySpotifyData;

/**
   * .setAlbum
   * @param {string} name Album Name
   * @returns {Spotify}
   * @example setAlbum("Alan Walker Album")
   */
setAlbum(name:string):Spotify;

  /**
   * .setAuthor
   * @param {string} name Artist Name
   * @returns {Spotify}
   * @example setAuthor("Alan Walker, Ava Max")
   */
  setAuthor(name:string):Spotify;

   /**
     * .setBorder
     * @param {string} color "hexcolor"
     * @returns {Spotify}
     * @example setBorder("#fff")
     */
  setBorder(color:string):Spotify;


  /**
     * .setOverlayOpacity
     * @param {number} opacity must be between 0 and 1
     * @returns {Spotify}
     * @example setOverlayOpacity(0.7)
     */
  setOverlayOpacity(opac?:number):Spotify;


  /**
     * .setBlur
     * @param {number} blur setImage blur effect px
     * @default blur 3
     * @returns {Spotify}
     * @example setBlur(5) - Max 15px
     */
  setBlur(blur?:number):Spotify;

  /**
   * .setImage
   * @param {string|Buffer|Image} image Album Or Song Image
   * @returns {Spotify}
   * @example setImage("https://someone-image.png")
   */
  setImage(image:string|Buffer):Spotify;

  /**
   * .setTitle
   * @param {string} title Title To Set
   * @returns {Spotify}
   * @example setTitle("Alone, Pt II")
   */
  setTitle(title:string):Spotify;


   /**
     * .setSpotifyLogo
     * @param {boolean} bool must be "true" or "false"
     * @returns {Spotify}
     * @default bool true
     * @example setSpotifyLogo(true)
     */
  setSpotifyLogo(bool?:boolean):Spotify;

  /**
   * .setTimestamp
   * @param {number} start Start Timestamp
   * @param {number} end End Timestamp
   * @returns {Spotify}
   * @example setTimestamp(40000,179000)
   */
  setTimestamp(start:number, end:number):Spotify;

    build(): Promise<Buffer>;
}

declare namespace Spotify { export { CanvafySpotifyData }; }

type CanvafySpotifyData = {
  album : null;
  artist : null;
  border : null;
  _bar_width : 1400;
  end : null;
  overlay_opacity : null;
  image : null;
  blur : 3;
  title : null;
  start : null;
  randomColors : ["#0c0c0c","#121212","#282828","#1c1c1c","#244c66"];
  spotifyLogo : true;
};
//# sourceMappingURL=spotify.d.ts.map
