const LevelModel = require("../../Models/LevelModel")
const ModuleHolder = require("../../Classes/ModuleHolder")

const moduleHolder = new ModuleHolder();
module.exports = {
  help: {
    name: "xp",
    aliases: ["xp-per-msg"],
    description: `Set the xp per message bot wil generate a number between 0 and the given xp.`,
    examples: [`xp <amount>`],
    permissions: 'ManageMessages',
    permissionsMe: ['none'],
    ownerOnly: false,
    file: __filename,
    arguments: [
      { name: 'number', description: 'set the xp per message bot wil generate a number between 0 and the given xp.', required: true },
    ]
  },
  async run(bot, message, args) {
    let argument = await message.options.getInteger("number") || null
    if (Number(argument) <= 0 || Number(argument) > 100) return message.followUp(`${moduleHolder.Modules.emojie.error} Pls choose a number above 0 and below 100!`).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err);

    const currentSettings = await bot.levelServices.GetAsync(message.guild.id) || new LevelModel(message.guild.id);

    currentSettings.XpPerMessage = Number(argument);
    const saved = await bot.levelServices.SetAsync(currentSettings);
    switch (saved?.acknowledged ?? false) {
      case true:
        let onembed = new moduleHolder.Modules.discord.EmbedBuilder()
          .setDescription(`Succesfully set level xp per message to ${argument}!`)
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
