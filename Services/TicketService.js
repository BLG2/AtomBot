const { GuildMember, Guild } = require("discord.js");
const { ObjectId } = require("mongodb");
const ModuleHolder = require("../Classes/ModuleHolder");
const MongoDB = require("../Classes/MongoDB");
const OpenTicketModel = require("../Models/OpenTicketModel");
const TicketModel = require("../Models/TicketModel");

const moduleHolder = new ModuleHolder();
module.exports = class TicketService {
  MongoDb;
  /**
 * @param {MongoDB} mongoDb
 */
  constructor(mongoDb) {
    this.MongoDb = mongoDb;
  }

  // Ticket system

  /**
 * @param {String} guildId
 */
  async GetAsync(guildId) {
    if (!guildId) { return console.log(`guildId not defined -> ${guildId}`) }
    return this.MongoDb.GetOneAsync("AtomBot", "Ticket", { GuildId: guildId })
  }
  /**
 * @param {TicketModel} ticketModel
 */
  async SetAsync(ticketModel) {
    if (!ticketModel.GuildId) { return console.log(`guildId not defined -> ${ticketModel.GuildId}`) }
    var fetchedData = await this.GetAsync(ticketModel.GuildId) || null;
    if (!fetchedData) {
      return this.MongoDb.AddOneAsync("AtomBot", "Ticket", ticketModel);
    } else {
      return this.MongoDb.UpdateOneAsync("AtomBot", "Ticket", fetchedData, ticketModel);
    }
  }


  // Open Tickets

  /**
  * @param {String} guildId
  */
  async GetAllOpenTicketsAsync(guildId) {
    if (!guildId) { return console.log(`guildId not defined -> ${guildId}`) }
    let allItems = await this.MongoDb.GetAllAsync("AtomBot", "OpenTicket") || [];
    return allItems ? allItems.filter(t => t.GuildId == guildId) : [];
  }

  /**
  * @param {String} guildId
  * @param {String} memberId
  */
  async GetOpenTicketByMemberAsync(guildId, memberId) {
    if (!guildId) { return console.log(`guildId not defined -> ${guildId}`) }
    if (!memberId) { return console.log(`memberId not defined -> ${memberId}`) }
    return this.MongoDb.GetOneAsync("AtomBot", "OpenTicket", { GuildId: guildId, TicketMemberId: memberId })
  }

  /**
* @param {String} guildId
* @param {String} channelId
*/
  async GetOpenTicketByChannelAsync(guildId, channelId) {
    if (!guildId) { return console.log(`guildId not defined -> ${guildId}`) }
    if (!channelId) { return console.log(`channelId not defined -> ${channelId}`) }
    return this.MongoDb.GetOneAsync("AtomBot", "OpenTicket", { GuildId: guildId, ChannelId: channelId })
  }

  /**
 * @param {OpenTicketModel} openTicketModel
 */
  async SetOpenTicketAsync(openTicketModel) {
    if (!openTicketModel.GuildId) { return console.log(`guildId not defined -> ${openTicketModel.GuildId}`) }
    if (!openTicketModel.ChannelId) { return console.log(`channelId not defined -> ${openTicketModel.ChannelId}`) }
    if (!openTicketModel.TicketMemberId) { return console.log(`memberId not defined -> ${openTicketModel.TicketMemberId}`) }
    var fetchedData = await this.GetOpenTicketByMemberAsync(openTicketModel.GuildId, openTicketModel.TicketMemberId) || null;
    if (!fetchedData) {
      return this.MongoDb.AddOneAsync("AtomBot", "OpenTicket", openTicketModel);
    } else {
      return this.MongoDb.UpdateOneAsync("AtomBot", "OpenTicket", fetchedData, openTicketModel);
    }
  }


  /**
 * @param {OpenTicketModel} openTicketModel
*/
  async RemoveOpenTicketByChannelAsync(openTicketModel) {
    if (!openTicketModel.GuildId) { return console.log(`guildId not defined -> ${openTicketModel.GuildId}`) }
    if (!openTicketModel.ChannelId) { return console.log(`channelId not defined -> ${openTicketModel.ChannelId}`) }
    return this.MongoDb.RemoveOneAsync("AtomBot", "OpenTicket", openTicketModel);
  }


  /**
 * @param {MessageOrInteraction} requester
 * @param {Boolean} closing
 * @param {OpenTicketModel} openTicketModel
 * @param {GuildMember} requester
*/
  async SaveTranscription(messageOrInteraction, openTicketModel, closing = false, requester = null) {
    if (!messageOrInteraction) { return console.log(`messageOrInteraction not defined (pls define the message or interaction event) -> ${messageOrInteraction}`) }
    if (!openTicketModel) { return console.log(`openTicketModel not defined -> ${openTicketModel}`) }
    if (!openTicketModel.GuildId) { return console.log(`guildId not defined -> ${openTicketModel.GuildId}`) }
    if (!openTicketModel.ChannelId) { return console.log(`channelId not defined -> ${openTicketModel.ChannelId}`) }
    if (!messageOrInteraction || !messageOrInteraction.guild) { return console.log(`Interaction or Message guild not defined -> ${messageOrInteraction}`) }
    if (!messageOrInteraction || !messageOrInteraction.channel) { return console.log(`Interaction or Message channel not defined -> ${messageOrInteraction}`) }
    let ticketChannel = messageOrInteraction.guild.channels.cache.get(openTicketModel?.ChannelId ?? "000") || { name: "Unknown" }

    let data = `
<Server-Info>
Server: ${messageOrInteraction.guild.name} (${openTicketModel.GuildId})
Channel: ${ticketChannel.name} (${openTicketModel.ChannelId})
Messages: ${openTicketModel.TicketMessages.length}
TicketID: ${openTicketModel.TicketId}
TicketUserID: ${openTicketModel.TicketMemberId}
<script src="https://tickettool.xyz/transcript/transcript.bundle.min.obv.js"></script>
<script type="text/javascript">
let channel = {"name": "${ticketChannel.name}", "id": "${openTicketModel.ChannelId}"};
let server = {"name": "${messageOrInteraction.guild.name}", "id": "${openTicketModel.GuildId}", "icon": "${messageOrInteraction.guild.icon}"};
let messages = [${openTicketModel.TicketMessages}]
window.Convert(messages, channel, server)
</script>
      `
    await moduleHolder.Modules.fs.promises.writeFile(`${__dirname}/../TicketTranscriptions/${openTicketModel.GuildId}_${openTicketModel.ChannelId}.html`, data)
      .then(async file => {
        if (closing) {
          await messageOrInteraction.reply({ content: `Transcript | ticket name: ${openTicketModel.TicketId}`, files: [`${__dirname}/../TicketTranscriptions/${openTicketModel.GuildId}_${openTicketModel.ChannelId}.html`] }).catch(err => { messageOrInteraction.followUp({ content: `Somthing went whrong -> ${err}`, ephemeral: true }) });
        } else {
          if (messageOrInteraction.channel.id != openTicketModel.ChannelId) return messageOrInteraction.followUp({ content: `You can only use this command in a ticket channel.`, ephemeral: true })
          if (requester) {
            await requester.send({ content: `Saved Transcript | ticket name: ${openTicketModel.TicketId}`, files: [`${__dirname}/../TicketTranscriptions/${openTicketModel.GuildId}_${openTicketModel.ChannelId}.html`] }).catch(err => { messageOrInteraction.followUp({ content: `Somthing went whrong sending the dm -> ${err}`, ephemeral: true }) });
          } else {
            await messageOrInteraction.followUp({ content: `Saved Transcript | ticket name: ${openTicketModel.TicketId}`, files: [`${__dirname}/../TicketTranscriptions/${openTicketModel.GuildId}_${openTicketModel.ChannelId}.html`], ephemeral: true }).catch(err => { messageOrInteraction.followUp({ content: `Somthing went whrong sending the dm -> ${err}`, ephemeral: true }) });
          }
        }
      })
      .catch(err => {
        messageOrInteraction.followUp({ content: `Somthing went whrong -> ${err}`, ephemeral: true })
      });
    setTimeout(async () => {
      try {
        moduleHolder.Modules.fs.promises.unlink(`${__dirname}/../TicketTranscriptions/${openTicketModel.GuildId}_${openTicketModel.ChannelId}.html`).catch(e => { })
      } catch (e) { }
    }, 300000) // 300000 -> 5min

  }


  /**
 * @param {Guild} guild
 */
  async SendMessageAsync(guild) {
    let currentSettings = await this.GetAsync(guild.id) || null;
    if (!currentSettings) return null;
    let ticketChannel = guild.channels.cache.get(currentSettings?.ChannelId ?? "000") || null;
    if (!ticketChannel) return null;
    let ticketMessage = await ticketChannel.messages.fetch(currentSettings?.TicketMessageId ?? "000").catch(e => { }) || null

    const embed = new moduleHolder.Modules.discord.EmbedBuilder()
      .setTitle(`Ticket System`)
      .setDescription(`${currentSettings.TicketMessage}`)
      .setColor(moduleHolder.Modules.discord.Colors.Blue);
    let btn = new moduleHolder.Modules.discord.ButtonBuilder()
      .setCustomId(`open_ticket_${guild.id}`)
      .setEmoji(`📨`)
      .setStyle(1)
    let ButtonsToAdd = new moduleHolder.Modules.discord.ActionRowBuilder()
      .addComponents(btn)

    if (ticketMessage) {
      await ticketMessage.edit({
        embeds: [embed],
        "components": [ButtonsToAdd]
      }).catch(err => { })
    } else {
      await ticketChannel.send({
        embeds: [embed],
        "components": [ButtonsToAdd]
      }).then(async m => {
        currentSettings.TicketMessageId = m.id
        await this.SetAsync(currentSettings);
      }).catch(err => { })
    }
  }






  /**
* @param {String} dbTicketObjectId
*/
  async GetOpenTicketByObjectIdAsync(dbTicketObjectId) {
    if (!dbTicketObjectId) { return console.log(`dbTicketObjectId not defined -> ${dbTicketObjectId}`) }
    return this.MongoDb.GetOneAsync("AtomBot", "OpenTicket", { _id: new ObjectId(dbTicketObjectId) })
  }















}
