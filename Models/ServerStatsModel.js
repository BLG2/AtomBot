module.exports = class ServerStatsModel {
  GuildId;
  Enabled;
  TotalMembersChannelId;
  MembersChannelId;
  BotsChannelId;
  OfflineChannelId;
  OnlineChannelId;
  IdleChannelId;
  DndChannelId;
  LiveChannelId;
  ChannelsChannelId;
  RolesChannelId;
  /**
* @param {String} guildId
* @param {Boolean} enabled
* @param {string} totalMembersChannelId
* @param {string} membersChannelId
* @param {string} botsChannelId
* @param {string} offlineChannelId
* @param {string} onlineChannelId
* @param {string} idleChannelId
* @param {string} dndChannelId
* @param {string} liveChannelId
* @param {string} channelsChannelId
* @param {string} rolesChannelId
*/
  constructor(
    guildId,
    enabled = false,
    totalMembersChannelId = "000",
    membersChannelId = "000",
    botsChannelId = "000",
    offlineChannelId = "000",
    onlineChannelId = "000",
    idleChannelId = "000",
    dndChannelId = "000",
    liveChannelId = "000",
    channelsChannelId = "000",
    rolesChannelId = "000",
  ) {
    this.GuildId = guildId;
    this.Enabled = enabled;
    this.TotalMembersChannelId = totalMembersChannelId
    this.MembersChannelId = membersChannelId
    this.BotsChannelId = botsChannelId
    this.OfflineChannelId = offlineChannelId
    this.OnlineChannelId = onlineChannelId
    this.IdleChannelId = idleChannelId
    this.DndChannelId = dndChannelId
    this.LiveChannelId = liveChannelId
    this.ChannelsChannelId = channelsChannelId
    this.RolesChannelId = rolesChannelId
  }

}
