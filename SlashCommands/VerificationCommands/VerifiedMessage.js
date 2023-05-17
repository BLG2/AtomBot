const VerificationModel = require("../../Models/VerificationModel")
const ModuleHolder = require("../../Classes/ModuleHolder")
const ValidatorHelperService = require("../../Services/ValidatorHelperService");
const validator = new ValidatorHelperService();

const moduleHolder = new ModuleHolder();
module.exports = {
  help: {
    name: "verified-message",
    aliases: ["vmsg"],
    description: `Set the verification message to send afther somone verified (dm)`,
    examples: [`vmsg <message>`],
    permissions: 'ManageMessages',
    permissionsMe: ['ManageMessages'],
    ownerOnly: false,
    file: __filename,
    arguments: [
      { name: 'message_string', description: 'message to send the user afther he verified', required: true },
    ]
  },
  async run(bot, message, args) {

    let msg = await message.options.getString("message_string")

    const currentSettings = await bot.verificationServices.GetAsync(message.guild.id) || new VerificationModel(message.guild.id);
    currentSettings.verifiedMessage = msg;

    const saved = await bot.verificationServices.SetAsync(currentSettings);
    switch (saved?.acknowledged ?? false) {
      case true:
        let onembed = new moduleHolder.Modules.discord.EmbedBuilder()
          .setDescription(`${moduleHolder.Modules.emojie.succes} verification message has been set to\n${validator.ReplaceStringTags(msg, message.guild, message.member)}`)
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
