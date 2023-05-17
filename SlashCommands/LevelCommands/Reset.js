const InviteModel = require("../../Models/InviteModel")
const ModuleHolder = require("../../Classes/ModuleHolder")

const moduleHolder = new ModuleHolder();
module.exports = {
  help: {
    name: "reset",
    aliases: ["rst"],
    description: `Reset everyones level`,
    examples: [`reset`],
    permissions: 'ManageMessages',
    permissionsMe: ['ManageMessages'],
    ownerOnly: false,
    file: __filename,
    arguments: []
  },
  async run(bot, message, args) {

    const saved = await bot.levelServices.ResetAllMemberLevelAsync(message.guild.id);
    switch (saved?.acknowledged ?? false) {
      case true:
        let onembed = new moduleHolder.Modules.discord.EmbedBuilder()
          .setDescription(`${moduleHolder.Modules.emojie.succes} Resetted everyones level`)
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
