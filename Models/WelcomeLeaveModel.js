const WelcomeLeaveEmbedModel = require("./WelcomeLeaveEmbedModel");

module.exports = class WelcomeLeaveModel {
  GuildId;
  WelcomeEmbed;
  WelcomeChannelId;
  LeaveEmbed;
  LeaveChannelId;
  Enabled;
  /**
* @param {String} guildId
* @param {WelcomeLeaveEmbedModel} welcomeEmbed
* @param {String} welcomeChannelId
* @param {WelcomeLeaveEmbedModel} leaveEmbed
* @param {String} leaveChannelId
* @param {Boolean} enabled
*/
  constructor(guildId, welcomeEmbed = null, welcomeChannelId = "000", leaveEmbed = null, leaveChannelId = "000", enabled = false) {
    this.GuildId = guildId;
    this.WelcomeEmbed = welcomeEmbed ? welcomeEmbed : new WelcomeLeaveEmbedModel(guildId, "Hi, @memberTag", "@memberAvatar", null, null, "Welcome to our server pls read our rules.", null, "@guildName - MemberCount: @memberCount", "@guildIcon", null);
    this.WelcomeChannelId = welcomeChannelId;
    this.LeaveEmbed = leaveEmbed ? leaveEmbed : new WelcomeLeaveEmbedModel(guildId, "@memberTag left the server. /n Member joined: @memberJoined", "@memberAvatar", null, null, null, null, "@guildName - MemberCount: @memberCount", "@guildIcon", null);
    this.LeaveChannelId = leaveChannelId;
    this.Enabled = enabled;
  }

}
