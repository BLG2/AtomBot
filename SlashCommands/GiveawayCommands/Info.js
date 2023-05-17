const ModuleHolder = require("../../Classes/ModuleHolder");
const moduleHolder = new ModuleHolder();

module.exports = {
  help: {
    name: "info",
    aliases: ["gvw-info", "gvwinf"],
    description: `Get some info about the mentioned giveawayID.`,
    examples: [`giveaway-info <messageID>`],
    permissions: 'none',
    permissionsMe: ['none'],
    ownerOnly: false,
    file: __filename,
    arguments: [
      { name: 'message_id_string', description: 'The giveaway message ID', required: false },
    ]
  },
  async run(bot, message, args) {
    let messageID = await message.options.getString("message_id_string") || null;

    if (messageID) {
      let fetchedGiveaway = await bot.giveawayServices.GetAsync(message.guild.id, messageID) || null;
      if (!fetchedGiveaway) return message.followUp(`There is no giveaway with message id: ${messageID}`)


      let gvwDate = fetchedGiveaway.Time
      let gvwFormatDate = moduleHolder.Modules.moment(gvwDate)
      let relative = `${gvwFormatDate}`
      if (gvwFormatDate) {
        relative = moduleHolder.Modules.discordBuilder.time(gvwFormatDate._d, 'R') || ''
      }

      let embed = new moduleHolder.Modules.discord.EmbedBuilder()
      embed.setTitle(`Giveaway Info`)
      embed.setColor(moduleHolder.Modules.discord.Colors.Blue)
      embed.addFields([
        { name: "Prize", value: `${fetchedGiveaway.Prize ?? "Unknown"}` },
        { name: "Winners", value: `${fetchedGiveaway.Winners ?? "Unknown"}` },
        { name: "RequiredInvites", value: `${fetchedGiveaway.RequiredInvites ?? "Unknown"}` },
        { name: "RequiredMessages", value: `${fetchedGiveaway.RequiredMessages ?? "Unknown"}` },
        { name: "RequiredLevel", value: `${fetchedGiveaway.RequiredLevel ?? "Unknown"}` },
        { name: "Ends", value: `${relative ?? "Unknown"}` },
        { name: "ExcludeRoleIds", value: `${fetchedGiveaway.ExcludeRoleIds && fetchedGiveaway.ExcludeRoleIds.length > 0 ? fetchedGiveaway.ExcludeRoleIds.map(r => `<@&${r}>`) : "None"}` },
        { name: "Attendees", value: `${fetchedGiveaway.Attendees && fetchedGiveaway.Attendees.length > 0 ? fetchedGiveaway.Attendees.map(r => `<@${r}>`) : "None"}` },
        { name: "Message Link", value: `[Click Me](https://discord.com/channels/${message.guild.id}/${fetchedGiveaway.ChannelId}/${fetchedGiveaway.MessageId})` }
      ])
      message.followUp({ embeds: [embed] }).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err);

    } else {
      let fetchedGiveaway = await bot.giveawayServices.GetAllAsync(message.guild.id) || null;
      if (!fetchedGiveaway || fetchedGiveaway.length <= 0) return message.followUp(`There are no running giveaways in this server.`)
      let embed = new moduleHolder.Modules.discord.EmbedBuilder()
      embed.setTitle(`Active Giveaways`)
      embed.setColor(moduleHolder.Modules.discord.Colors.Blue)
      embed.addFields([])
      await fetchedGiveaway.forEach(item => {
        embed.data.fields.push({
          name: `ID: ${item.MessageId}`, value: `Prize: ${item.Prize}\nWinners: ${item.Winners}\nRequiredInvites: ${item.RequiredInvites}\nRequiredMessages: ${item.RequiredMessages}\nRequiredLevel: ${item.RequiredLevel}\nAttendees: ${item.Attendees.length}\nMessageLink: [Click Me](https://discord.com/channels/${message.guild.id}/${item.ChannelId}/${item.MessageId})`
        })
      })
      message.followUp({ embeds: [embed] }).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err);
    }
  }
};
