module.exports = class MemberInvitesModel {
  GuildId;
  MemberId;
  Joins;
  Leaves;
  Fakes;
  Stays;
  InvitedUserIds;
  /**
* @param {String} guildId
* @param {String} memberId
* @param {Number} joins
* @param {Number} leaves
* @param {Number} fakes
* @param {Number} stays
* @param {Array<String>} invitedUserIds
*/
  constructor(guildId, memberId, joins = 0, leaves = 0, fakes = 0, stays = 0, invitedUserIds= []) {
    this.GuildId = guildId;
    this.MemberId = memberId;
    this.Joins = joins;
    this.Leaves = leaves;
    this.Fakes = fakes;
    this.Stays = stays;
    this.InvitedUserIds = invitedUserIds;
  }

}
