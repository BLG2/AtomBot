module.exports = class GuildInviteModel {
  Code;
  InviterId;
  Uses;
  /**
* @param {String} code
* @param {string} inviterId
* @param {Number} uses
*/
  constructor(code, inviterId, uses = 1) {
    this.Code = code;
    this.InviterId = inviterId;
    this.Uses = uses;
  }

}
