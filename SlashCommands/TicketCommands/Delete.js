const ModuleHolder = require("../../Classes/ModuleHolder");
const moduleHolder = new ModuleHolder();
module.exports = {
  help: {
    name: "delete",
    aliases: ["del"],
    description: `Delete an open ticket`,
    examples: [`del <#channel>`],
    permissions: 'ManageChannels',
    permissionsMe: ['ManageChannels'],
    ownerOnly: false,
    file: __filename,
    arguments: [
      { name: 'ticket_channel', description: 'Channel', required: true },
    ]
  },
  async run(bot, message, args) {
    let channel = await message.options.getChannel("ticket_channel") || null
    if (!channel) return message.followUp(`Pls provide the channel!`).catch(err => console.err);

    const openTicket = await bot.ticketServices.GetOpenTicketByChannelAsync(message.guild.id, channel.id) || null;
    if (!openTicket) return message.followUp({ content: `Looks like this ticket doesnt exist in the db.` }).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err);
    const ticketSettings = await bot.ticketServices.GetAsync(message.guild.id) || new TicketModel(message.guild.id);
    if (!ticketSettings) return message.followUp({ content: `Looks like i could not find the ticket settings in the db.` }).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err);

    let ticketLogChannel = await message.guild.channels.cache.get(ticketSettings?.LogChannelId ?? "000");
    let involvedUsers = [];

    await openTicket.TicketMessages.forEach(async m => {
      try {
        let toJson = JSON.parse(m);
        if (toJson && toJson.authorId && !involvedUsers.includes(toJson.authorId)) {
          involvedUsers.push(toJson.authorId);
        }
      } catch (e) { }
    })

    await bot.ticketServices.RemoveOpenTicketByChannelAsync(openTicket);
    let reopenEmbed = new moduleHolder.Modules.discord.EmbedBuilder()
      .setAuthor({ name: `Ticket Deleted`, iconURL: message.member.user.displayAvatarURL({ dynamic: true }) })
      .addFields([
        { name: `Executor:`, value: `${message.member.user.tag} | ${message.member}` },
        { name: `Ticket ID:`, value: `${openTicket.TicketId ?? "Unknown"}` },
        { name: `Ticket User:`, value: `<@${openTicket.TicketMemberId}> | ${openTicket.TicketMemberId}` },
        { name: `Tagged Ids:`, value: `${ticketSettings.RolesToTagIds.length > 0 ? ticketSettings.RolesToTagIds.map(r => `<@&${r}>`) : 'None'}` },
        { name: `Involved Users:`, value: `${involvedUsers.length > 0 ? involvedUsers.map(u => `<@${u}>`) : `Unknown`}` },
        { name: `Ticket Opened:`, value: `${moduleHolder.Modules.discordBuilder.time((moduleHolder.Modules.moment(openTicket.TicketOpened))._d, 'R')}` },
      ])
      .setColor(moduleHolder.Modules.discord.Colors.Blue)
    ticketLogChannel?.send({ embeds: [reopenEmbed] }).then(async m => {
      await bot.ticketServices.SaveTranscription(m, openTicket, true);
    }).catch(err => console.err);

    message.channel.delete().catch(e => {
      return message.followUp(`Error deleting channel -> ${e}`).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err)
    })
    message.followUp(`Deleted ticket ID: ${openTicket.TicketId}`).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err)

  }
};


