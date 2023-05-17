module.exports = class GuessTheNumberModel {
  GuildId;
  ChannelId;
  Enabled;
  MinimumNumber;
  MaximumNumber;
  WinningNumber;
  Prize;
  IgnoreRoleIds;
  /**
* @param {String} guildId
* @param {Array<string>} roleIds
* @param {Boolean} enabled
*/
  constructor(guildId, channelId, enabled = false, minimumNumber = 0, maximumNumber = 1000, winningNumber = 371, prize = "Fun!", ignoreRoleIds = []) {
    this.GuildId = guildId;
    this.ChannelId = channelId;
    this.Enabled = enabled;
    this.MinimumNumber = minimumNumber;
    this.MaximumNumber = maximumNumber;
    this.WinningNumber = winningNumber;
    this.Prize = prize;
    this.IgnoreRoleIds = ignoreRoleIds;
  }

}
