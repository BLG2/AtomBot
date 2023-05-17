const TicketModel = require("../../Models/TicketModel");
const ModuleHolder = require("../../Classes/ModuleHolder");
const moduleHolder = new ModuleHolder();
module.exports = {
  help: {
    name: "channel",
    aliases: ["chan"],
    description: `Set one of the ticket channels.`,
    examples: [`chan <#channel>`],
    permissions: 'ManageChannels',
    permissionsMe: ['ManageChannels'],
    ownerOnly: false,
    file: __filename,
    arguments: [
      { name: 'channel', description: 'Channel', required: true },
      { name: 'option_string', description: 'choises', required: true, options: ["Ticket_Category", "Ticket", "Queue", "Logs"] },
    ]
  },
  async run(bot, message, args) {
    let option = await message.options.getString("option_string") || "Ticket";
    let channel = await message.options.getChannel("channel") || null
    if (!channel) return message.followUp(`Pls provide the channel!`).catch(err => console.err);
    const currentSettings = await bot.ticketServices.GetAsync(message.guild.id) || new TicketModel(message.guild.id);

    switch (option) {
      case "Queue":
        currentSettings.QueueChannelId = channel.id;
        break;
      case "Ticket_Category":
        currentSettings.CategoryId = channel.id;
        break;
      case "Logs":
        currentSettings.LogChannelId = channel.id;
        break;
      case "Ticket":
        currentSettings.ChannelId = channel.id;
        break;
    }

    const saved = await bot.ticketServices.SetAsync(currentSettings);
    switch (saved?.acknowledged ?? false) {
      case true:
        let onembed = new moduleHolder.Modules.discord.EmbedBuilder()
          .setDescription(`${moduleHolder.Modules.emojie.succes} Ticket ${option} channel has been set to ${channel}`)
          .setColor(moduleHolder.Modules.discord.Colors.Blue)
          .setFooter({ text: `${moduleHolder.Modules.private.embedFooter}`, iconURL: `${bot.user.displayAvatarURL({ extension: 'png' })}` })
        message.followUp({ embeds: [onembed] }).catch(err => console.err);
        break;
      case false:
        let errorEmbed = new moduleHolder.Modules.discord.EmbedBuilder()
          .setDescription(`${moduleHolder.Modules.emojie.error} Somthing went whrong.`)
          .setColor(moduleHolder.Modules.discord.Colors.Red)
          .setFooter({ text: `${moduleHolder.Modules.private.embedFooter}`, iconURL: `${bot.user.displayAvatarURL({ extension: 'png' })}` })
        message.followUp({ embeds: [errorEmbed] }).catch(err => console.err);
        break;
    }



  }
};

