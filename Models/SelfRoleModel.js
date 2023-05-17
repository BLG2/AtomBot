module.exports = class SelfRoleModel {
  GuildId;
  ChannelId;
  RoleIds;
  Enabled;
  /**
* @param {String} guildId
* @param {String} channelId
* @param {Array<string>} roleIds
* @param {Boolean} enabled
*/
  constructor(guildId, channelId, roleIds = [], enabled = false) {
    this.GuildId = guildId;
    this.ChannelId = channelId;
    this.RoleIds = roleIds;
    this.Enabled = enabled;
  }

}
