const TicketModel = require("../../Models/TicketModel")
const ModuleHolder = require("../../Classes/ModuleHolder")

const moduleHolder = new ModuleHolder();
module.exports = {
  help: {
    name: "ticket-message",
    aliases: ["tmsg"],
    description: `Set the message on the ticket embed.`,
    examples: [`tmsg <message>`],
    permissions: 'ManageMessages',
    permissionsMe: ['ManageMessages'],
    ownerOnly: false,
    file: __filename,
    arguments: [
      { name: 'message_string', description: 'message to display in the ticket embed', required: false },
    ]
  },
  async run(bot, message, args) {

    let msg = await message.options.getString("message_string") || "React with 📨 to open an ticket.";

    const currentSettings = await bot.ticketServices.GetAsync(message.guild.id) || new TicketModel(message.guild.id);
    currentSettings.TicketMessage = msg;
    const ticketChannel = message.guild.channels.cache.get(currentSettings?.ChannelId ?? "000") || null;
    if (!ticketChannel) return message.followUp({ content: `Ticket channel not found.` })
    if (currentSettings.Enabled == true) {
      await ticketServices.SendMessageAsync(message.guild);
    }

    const saved = await bot.ticketServices.SetAsync(currentSettings);
    switch (saved?.acknowledged ?? false) {
      case true:
        let onembed = new moduleHolder.Modules.discord.EmbedBuilder()
          .setDescription(`${moduleHolder.Modules.emojie.succes} ticket embed message has been set to\n${msg}`)
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
}
