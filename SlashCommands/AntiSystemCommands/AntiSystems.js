const AntiSystemModel = require("../../Models/AntiSystemModel")
const ModuleHolder = require("../../Classes/ModuleHolder")

const moduleHolder = new ModuleHolder();
module.exports = {
  help: {
    name: "anti",
    aliases: ["antisystem"],
    description: `Enable/disable anti system`,
    examples: [`anti <on/off>`],
    permissions: 'ManageMessages',
    permissionsMe: ['ManageMessages'],
    ownerOnly: false,
    file: __filename,
    arguments: [
      { name: 'option_string', description: 'choices', required: true, options: ["AntiLink", "AntiMalLink", "AntiSelfbot", "AntiSpam", "AntiMassJoin", "AntiIp", "AntiDeleteChannels", "AntiGhostPing", "AntiBots", "AntiNonAscii"] },
      { name: 'boolean', description: 'enable or disable the system', required: true },
    ]
  },
  async run(bot, message, args) {

    let systemName = await message.options.getString("option_string") || null
    let system = await message.options.getBoolean("boolean")

    const currentSettings = await bot.antiSystemServices.GetAsync(message.guild.id) || new AntiSystemModel(message.guild.id);
    currentSettings[systemName] = system;
    const saved = await bot.antiSystemServices.SetAsync(currentSettings);
    switch (saved?.acknowledged ?? false) {
      case true:
        let onembed = new moduleHolder.Modules.discord.EmbedBuilder()
          .setDescription(`${system ? moduleHolder.Modules.emojie.on : moduleHolder.Modules.emojie.off} Anti ${systemName.toLowerCase()} system has been set to ${system}`)
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
