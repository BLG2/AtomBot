module.exports = class WarnUserModel {
  GuildId;
  MemberId;
  WarnType;
  WarnCount;
  /**
* @param {String} guildId
* @param {String} memberId
* @param {String} warnType
* @param {Number} warnCount
*/
  constructor(guildId, memberId, warnType = "Server", warnCount = 1) {
    this.GuildId = guildId;
    this.MemberId = memberId;
    this.WarnType = warnType;
    this.WarnCount = warnCount;
  }

}
