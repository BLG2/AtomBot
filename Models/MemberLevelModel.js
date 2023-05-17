module.exports = class MemberLevelModel {
  GuildId;
  MemberId;
  Level;
  Xp;
  TotalXp;
  /**
* @param {String} guildId
* @param {String} memberId
* @param {Number} level
* @param {Number} xp
* @param {Number} totalXp
*/
  constructor(guildId, memberId, level = 0, xp = 0, totalXp = 0) {
    this.GuildId = guildId;
    this.MemberId = memberId;
    this.Level = level;
    this.Xp = xp;
    this.TotalXp = totalXp;
  }

}
