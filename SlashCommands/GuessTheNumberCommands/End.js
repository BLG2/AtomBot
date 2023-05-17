const GuessTheNumberModel = require("../../Models/GuessTheNumberModel");
const ModuleHolder = require("../../Classes/ModuleHolder")

const moduleHolder = new ModuleHolder();
module.exports = {
  help: {
    name: "end",
    aliases: ["end-guess-the-nr", "eguess"],
    description: 'End the current running guess the number game.',
    examples: [`end`],
    permissions: 'ManageMessages',
    permissionsMe: ['none'],
    ownerOnly: false,
    file: __filename,
    arguments: []
  },
  async run(bot, message, args) {

    const currentSettings = await bot.guessTheNumberServices.GetAsync(message.guild.id) || null;

    if (!currentSettings) {
      let embed = new moduleHolder.Modules.discord.EmbedBuilder()
        .setDescription(`${moduleHolder.Modules.emojie.error} There is no guess the nr running in this server.`)
        .setColor(moduleHolder.Modules.discord.Colors.Red)
        .setFooter({ text: `${moduleHolder.Modules.private.embedFooter}`, iconURL: `${bot.user.displayAvatarURL({ extension: 'png' })}` })
      return message.followUp({ embeds: [embed] }).catch(err => console.err);
    }


    const deleted = await bot.guessTheNumberServices.RemoveAsync(currentSettings);
    switch (deleted?.acknowledged ?? false) {
      case true:
        let succesE = new moduleHolder.Modules.discord.EmbedBuilder()
          .setColor(moduleHolder.Modules.discord.Colors.Blue)
          .setDescription(`Succesfully ended guess the number game.`)
          .setFooter({ text: `${moduleHolder.Modules.private.embedFooter}`, iconURL: `${bot.user.displayAvatarURL({ extension: 'png' })}` })
        message.followUp({ embeds: [succesE] }).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err)
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
