const ModuleHolder = require("../../Classes/ModuleHolder");
const ServerStatsModel = require("../../Models/ServerStatsModel");

const moduleHolder = new ModuleHolder();
module.exports = {
  help: {
    name: "system",
    aliases: ["statssys"],
    description: `Enable/disable stats system`,
    examples: [`statssys <on/off>`],
    permissions: 'ManageChannels',
    permissionsMe: ['ManageChannels'],
    ownerOnly: false,
    file: __filename,
    arguments: [
      { name: 'boolean', description: 'enable or disable the system', required: true },
    ]
  },
  async run(bot, message, args) {

    let system = await message.options.getBoolean("boolean")

    const currentSettings = await bot.serverStatsServices.GetAsync(message.guild.id) || new ServerStatsModel(message.guild.id);
    currentSettings.Enabled = system;
    const saved = await bot.serverStatsServices.SetAsync(currentSettings);
    switch (saved?.acknowledged ?? false) {
      case true:
        let onembed = new moduleHolder.Modules.discord.EmbedBuilder()
          .setDescription(`${system ? moduleHolder.Modules.emojie.on : moduleHolder.Modules.emojie.off} ServerStats system has been set to ${system}`)
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
