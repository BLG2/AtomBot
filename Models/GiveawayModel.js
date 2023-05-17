const ms = require("ms");
module.exports = class GiveawayModel {
  GuildId;
  ChannelId;
  MessageId;
  LogChannelId;
  Time;
  Prize;
  Winners;
  RequiredInvites;
  RequiredMessages;
  RequiredLevel;
  Note;
  Ended;
  ExcludeRoleIds;
  Attendees;
  /**
* @param {String} guildId
* @param {String} channelId
* @param {String} messageId
* @param {String} logChannelId
* @param {DoubleRange} Time
* @param {String} prize
* @param {Number} winners
* @param {Number} requiredInvites
* @param {Number} requiredMessages
* @param {Number} requiredLevel
* @param {String} note
* @param {Boolean} ended
* @param {Array<string>} excludeRoleIds
* @param {Array<string>} attendees
*/
  constructor(guildId, channelId, messageId, logChannelId = "000", time = 259200000, prize = "Somthing special", winners = 1, requiredInvites = 0, requiredMessages = 0, requiredLevel = 0, note = "", ended = false, excludeRoleIds = [], attendees = []) {
    this.GuildId = guildId;
    this.ChannelId = channelId;
    this.MessageId = messageId;
    this.LogChannelId = logChannelId;
    this.Time = time;
    this.Prize = prize;
    this.Winners = winners;
    this.RequiredInvites = requiredInvites;
    this.RequiredMessages = requiredMessages;
    this.RequiredLevel = requiredLevel;
    this.Note = note;
    this.Ended = ended;
    this.ExcludeRoleIds = excludeRoleIds;
    this.Attendees = attendees;
  }

}
