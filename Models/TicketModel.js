module.exports = class TicketModel {
  GuildId;
  ChannelId;
  CategoryId;
  TicketMessageId;
  TicketMessage;
  TicketOpenedMessage;
  LogChannelId;
  QueueChannelId;
  Enabled;
  TotalOpenedTickets;
  RolesToTagIds;
  /**
* @param {String} guildId
* @param {String} channelId
* @param {String} categoryId
* @param {String} ticketMessageId
* @param {String} ticketMessage
* @param {String} ticketOpenedMessage
* @param {String} logChannelId
* @param {String} queueChannelId
* @param {Boolean} enabled
* @param {Number} totalOpenedTickets
* @param {Array<String>} rolesToTagIds
*/
  constructor(guildId, channelId = "000", categoryId = "000",ticketMessageId="000", ticketMessage = "React with 📨 to open an ticket!",
    ticketOpenedMessage = "Hi @member, drop your question here and support wil help you asap.",
    logChannelId = "000", queueChannelId = "000", enabled = false, totalOpenedTickets = 0, rolesToTagIds =[]
  )
  {
    this.GuildId = guildId;
    this.ChannelId = channelId;
    this.CategoryId = categoryId;
    this.TicketMessageId = ticketMessageId;
    this.TicketMessage = ticketMessage;
    this.TicketOpenedMessage = ticketOpenedMessage;
    this.LogChannelId = logChannelId;
    this.QueueChannelId = queueChannelId;
    this.Enabled = enabled;
    this.TotalOpenedTickets = totalOpenedTickets;
    this.RolesToTagIds = rolesToTagIds;
  }

}
