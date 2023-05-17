const ModuleHolder = require("../../Classes/ModuleHolder");
const moduleHolder = new ModuleHolder();
module.exports = {
  help: {
    name: "transcript",
    aliases: ["save-transcript"],
    description: `Save transcript from the current ticket.`,
    examples: [`transcript`],
    permissions: 'none',
    permissionsMe: ['none'],
    ownerOnly: false,
    file: __filename,
    arguments: []
  },
  async run(bot, message, args) {
    const openTicket = await bot.ticketServices.GetOpenTicketByChannelAsync(message.guild.id, message.channel.id) || null;
    if (!openTicket) return message.followUp({ content: `Looks like this ticket doesnt exist in the db.` }).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err);
    if (openTicket.ChannelId != message.channel.id) return message.followUp({ content: `You can only use this command in a ticket.` }).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err);

    const ticketSettings = await bot.ticketServices.GetAsync(message.guild.id) || new TicketModel(message.guild.id);
    if (!ticketSettings) return message.followUp({ content: `Looks like i could not find the ticket settings in the db.` }).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err);

    let ticketLogChannel = await message.guild.channels.cache.get(ticketSettings?.LogChannelId ?? "000");

    await bot.ticketServices.SaveTranscription(message, openTicket, false, message.member);

    let reopenEmbed = new moduleHolder.Modules.discord.EmbedBuilder()
      .setAuthor({ name: `Ticket Transcript Requested`, iconURL: message.member.user.displayAvatarURL({ dynamic: true }) })
      .addFields([
        { name: `Executor:`, value: `${message.member.user.tag} | ${message.member}` },
        { name: `Channel:`, value: `${message.channel.name} | ${message.channel}` }
      ])
      .setColor(moduleHolder.Modules.discord.Colors.Blue)
    ticketLogChannel?.send({ embeds: [reopenEmbed] }).then(async m => {
      await bot.ticketServices.SaveTranscription(m, openTicket, true);
    }).catch(err => console.err);

    message.followUp(`You should have a dm with the transcription`).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err)

  }
};


