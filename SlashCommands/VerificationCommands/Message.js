const VerificationModel = require("../../Models/VerificationModel")
const ModuleHolder = require("../../Classes/ModuleHolder")
const moduleHolder = new ModuleHolder();
module.exports = {
  help: {
    name: "message",
    aliases: ["msg"],
    description: `Set the verification embed message`,
    examples: [`msg <message>`],
    permissions: 'ManageMessages',
    permissionsMe: ['ManageMessages'],
    ownerOnly: false,
    file: __filename,
    arguments: [
      { name: 'message_string', description: 'message to display in the verification embed', required: false },
    ]
  },
  async run(bot, message, args) {

    let msg = await message.options.getString("message_string") || "Verify by clicking the ✅ below!";

    const currentSettings = await bot.verificationServices.GetAsync(message.guild.id) || new VerificationModel(message.guild.id);
    currentSettings.VerifyMessage = msg;
    const verifyChannel = message.guild.channels.cache.get(currentSettings?.ChannelId ?? "000") || null;
    if (!verifyChannel) return message.followUp({ content: `Verify channel not found.` })
    if (currentSettings.Enabled == true) {
      await bot.verificationServices.SendMessageAsync(message.guild);
    }

    const saved = await bot.verificationServices.SetAsync(currentSettings);
    switch (saved?.acknowledged ?? false) {
      case true:
        let onembed = new moduleHolder.Modules.discord.EmbedBuilder()
          .setDescription(`${moduleHolder.Modules.emojie.succes} verification message has been set to\n${msg}`)
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
