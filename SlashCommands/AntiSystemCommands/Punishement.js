const AntiSystemModel = require("../../Models/AntiSystemModel")
const ModuleHolder = require("../../Classes/ModuleHolder")

const moduleHolder = new ModuleHolder();

module.exports = {
  help: {
    name: "punishments",
    aliases: ["punishment", "punishement"],
    description: `Set a punishment for the anti and warn systems.`,
    examples: [`punishment`],
    permissions: 'ManageMessages',
    permissionsMe: ['none'],
    ownerOnly: false,
    file: __filename,
    arguments: [
      { name: 'punichment_string', description: 'Set a punishment for the anti and warn systems.', required: true, options: ["kick", "ban", "softban", "timeout", "none"] },
    ]
  },
  async run(bot, message, args) {
    let punishement = await message.options.getString("punichment_string") || null
    const currentSettings = await bot.antiSystemServices.GetAsync(message.guild.id) || new AntiSystemModel(message.guild.id);
    currentSettings.Punishement = punishement;
    const saved = await bot.antiSystemServices.SetAsync(currentSettings);
    switch (saved?.acknowledged ?? false) {
      case true:
        let onembed = new moduleHolder.Modules.discord.EmbedBuilder()
          .setDescription(`${moduleHolder.Modules.emojie.succes} Punishement set to ${punishement}`)
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
