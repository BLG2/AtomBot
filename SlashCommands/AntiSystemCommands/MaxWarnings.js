const AntiSystemModel = require("../../Models/AntiSystemModel")
const ModuleHolder = require("../../Classes/ModuleHolder")

const moduleHolder = new ModuleHolder();

module.exports = {
  help: {
    name: "maximum-warns",
    aliases: ["maximum-warnings", "maxwarns", "maximumwarnings"],
    description: `Set the maximum warnings amount to punish a user for the anti systems.`,
    examples: [`maximum-warns <amount>`],
    permissions: 'ManageMessages',
    permissionsMe: ['none'],
    ownerOnly: false,
    file: __filename,
    arguments: [
      { name: 'number', description: 'set the maximum warnings amount to punish a user for the anti systems.', required: true },
    ]
  },
  async run(bot, message, args) {
    let amount = await message.options.getInteger("number") || null
    if (Number(amount) < 0 || Number(amount) > 100) return message.followUp(`${moduleHolder.Modules.emojie.error} Pls choose a number above 0 and below 100!`).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err);

    const currentSettings = await bot.antiSystemServices.GetAsync(message.guild.id) || new AntiSystemModel(message.guild.id);
    currentSettings.MaxWarnings = Number(amount);
    const saved = await bot.antiSystemServices.SetAsync(currentSettings);
    if (saved.acknowledged == true) console.log('saved setting!')



    switch (saved?.acknowledged ?? false) {
      case true:
        let onembed = new moduleHolder.Modules.discord.EmbedBuilder()
          .setDescription(`${moduleHolder.Modules.emojie.succes} MaxWarnings set to ${amount}`)
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
