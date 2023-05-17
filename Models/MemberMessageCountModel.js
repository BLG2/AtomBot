module.exports = class MemberMessageCountModel {
  GuildId;
  MemberId;
  MessageCount;
  /**
* @param {String} guildId
* @param {String} memberId
* @param {Number} messageCount
*/
  constructor(guildId, memberId, messageCount = 0) {
    this.GuildId = guildId;
    this.MemberId = memberId;
    this.MessageCount = messageCount;
  }

}
