module.exports = class AntiSystemModel {
  GuildId;
  MaxWarnings;
  ExcludeChannelIds;
  ExcludeRoleIds;
  ExcludeCategoryIds;
  Punishement;
  AntiLink;
  AntiMalLink;
  AntiSelfbot;
  AntiSpam;
  AntiMassJoin;
  AntiIp;
  AntiDeleteChannels;
  AntiGhostPing;
  AntiBots;
  AntiNonAscii;
  LogChannelId;
  /**
* @param {String} guildId
* @param {String} punishement
* @param {String} logChannelId
* @param {Number} maxWarnings
* @param {Array<string>} excludeChannelIds
* @param {Array<string>} excludeRoleIds
* @param {Array<string>} excludeCategoryIds
* @param {Boolean} antiLink
* @param {Boolean} antiMalLink
* @param {Boolean} antiSelfbot
* @param {Boolean} antiSpam
* @param {Boolean} antiMassJoin
* @param {Boolean} antiIp
* @param {Boolean} antiDeleteChannels
* @param {Boolean} antiGhostPing
* @param {Boolean} antiBots
* @param {Boolean} antiNonAscii
*/
  constructor(guildId, maxWarnings = 3, excludeChannelIds = [], excludeRoleIds = [], excludeCategoryIds = [], punishement = "none",
    antiLink = false, antiMalLink = false, antiSelfbot = false, antiSpam = false, antiMassJoin = false, antiIp = false,
    antiDeleteChannels = false, antiGhostPing = false, antiBots = false, antiNonAscii = false, logChannelId = "000") {
    this.GuildId = guildId;
    this.MaxWarnings = maxWarnings;
    this.ExcludeChannelIds = excludeChannelIds;
    this.ExcludeRoleIds = excludeRoleIds;
    this.Punishement = punishement;
    this.AntiLink = antiLink;
    this.AntiMalLink = antiMalLink;
    this.AntiSelfbot = antiSelfbot;
    this.AntiSpam = antiSpam;
    this.AntiMassJoin = antiMassJoin;
    this.AntiIp = antiIp;
    this.AntiDeleteChannels = antiDeleteChannels;
    this.AntiGhostPing = antiGhostPing;
    this.AntiBots = antiBots;
    this.AntiNonAscii = antiNonAscii;
    this.LogChannelId = logChannelId;
    this.ExcludeCategoryIds = excludeCategoryIds;
  }

}
