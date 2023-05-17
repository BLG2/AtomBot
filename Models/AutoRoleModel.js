module.exports = class AutoRoleModel {
  GuildId;
  RoleIds;
  Enabled;
  /**
* @param {String} guildId
* @param {Array<string>} roleIds
* @param {Boolean} enabled
*/
  constructor(guildId, roleIds = [], enabled = false) {
    this.GuildId = guildId;
    this.RoleIds = roleIds;
    this.Enabled = enabled;
  }

}
