module.exports = class LevelModel {
  GuildId;
  Enabled;
  LogChannelId;
  XpPerMessage;
  /**
* @param {String} guildId
* @param {Boolean} enabled
* @param {String} logChannelId
* @param {Number} xpPerMessage
*/
  constructor(guildId, enabled = false, logChannelId = "000", xpPerMessage = 10) {
    this.GuildId = guildId;
    this.Enabled = enabled;
    this.LogChannelId = logChannelId;
    this.XpPerMessage = xpPerMessage;
  }

}
