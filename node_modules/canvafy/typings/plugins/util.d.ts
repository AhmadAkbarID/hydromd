export = Util;

/**
 * @typedef {object} Util
 * @see {Util}
 * @example const util = canvafy.Util()
 * @type {Class}
 */
declare class Util {

 /**
   * Formats time
   * @param {number} time
   * @returns {Util}
   */
 static format_time(time:number):Util;

 /**
   * rgbToHex
   * @param {r} Red
   * @param {g} Green
   * @param {b} Blue 
   * @returns {Util}
   */
  static rgbToHex(r:string, g:string, b:string):Util;

  /**
     * captchaKey
     * @param {length} length captchaKey Length
     * @default 8
     * @returns {Util}
     */
  static captchaKey(length:number):Util;

}

//# sourceMappingURL=util.d.ts.map