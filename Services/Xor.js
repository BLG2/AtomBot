const ModuleHolder = require("../Classes/ModuleHolder");

const moduleHolder = new ModuleHolder();
module.exports = class Xor{
  constructor() { }


  /**
 * @param {String} string
 * @param {String} password
 */
  async Encrypt(string, password = moduleHolder.Modules.private.xorKey) {
    let result = "";
    for (let i = 0; i < string.length; i++) {
      result += String.fromCharCode(string.charCodeAt(i) ^ password.charCodeAt(i % password.length));
    }
    let buff = new Buffer.from(result);
    var toBase64 = buff.toString("base64");
    return toBase64;
  }


  /**
 * @param {String} string
 * @param {String} password
 */
  async Decrypt(string, password = moduleHolder.Modules.private.xorKey) {
    let result = "";
    let buff = new Buffer.from(string, 'base64');
    let text = buff.toString('utf-8');
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(text.charCodeAt(i) ^ password.charCodeAt(i % password.length));
    }
    return result;
  }






}
