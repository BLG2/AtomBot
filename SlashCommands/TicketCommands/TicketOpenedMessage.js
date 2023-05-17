const TicketModel = require("../../Models/TicketModel")
const ModuleHolder = require("../../Classes/ModuleHolder");
const ValidatorHelperService = require("../../Services/ValidatorHelperService");
const validator = new ValidatorHelperService();
const moduleHolder = new ModuleHolder();
module.exports = {
  help: {
    name: "ticket-opened-message",
    aliases: ["tomsg"],
    description: `Set the message to send when a ticket has been opened.`,
    examples: [`omsg <message>`],
    permissions: 'ManageMessages',
    permissionsMe: ['ManageMessages'],
    ownerOnly: false,
    file: __filename,
    arguments: [
      { name: 'message_string', description: 'message to display in the opened ticket embed', required: false },
    ]
  },
  async run(bot, message, args) {

    let msg = await message.options.getString("message_string") || "Hi @member, drop your question here and support wil help you asap.";

    const currentSettings = await bot.ticketServices.GetAsync(message.guild.id) || new TicketModel(message.guild.id);
    currentSettings.TicketOpenedMessage = msg;

    const saved = await bot.ticketServices.SetAsync(currentSettings);
    switch (saved?.acknowledged ?? false) {
      case true:
        let onembed = new moduleHolder.Modules.discord.EmbedBuilder()
          .setDescription(`${moduleHolder.Modules.emojie.succes} ticket embed opened message has been set to\n${validator.ReplaceStringTags(msg, message.guild, message.member)}`)
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
