module.exports = class InviteModel {
  GuildId;
  Enabled;
  ChannelId;
  /**
* @param {String} guildId
* @param {Boolean} enabled
* @param {String} channelId
*/
  constructor(guildId, enabled = false, channelId = "000") {
    this.GuildId = guildId;
    this.Enabled = enabled;
    this.ChannelId = channelId;
  }
}
