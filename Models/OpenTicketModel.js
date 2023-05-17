const { Message } = require("discord.js");

module.exports = class OpenTicketModel {
  TicketId;
  GuildId;
  ChannelId;
  TicketMemberId;
  TicketMessages;
  TicketOpened;
  /**
* @param {String} ticketId
* @param {String} guildId
* @param {String} channelId
* @param {String} ticketMemberId
* @param {Arrar<Message>} ticketMessages
* @param {DoubleRange} ticketOpened
*/
  constructor(ticketId, guildId, channelId, ticketMemberId, ticketMessages = [], ticketOpened = Date.now()) {
    this.TicketId = ticketId;
    this.GuildId = guildId;
    this.ChannelId = channelId;
    this.TicketMemberId = ticketMemberId;
    this.TicketMessages = ticketMessages;
    this.TicketOpened = ticketOpened;
  }

}
