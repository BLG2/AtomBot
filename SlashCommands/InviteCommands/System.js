const InviteModel = require("../../Models/InviteModel")
const ModuleHolder = require("../../Classes/ModuleHolder")

const moduleHolder = new ModuleHolder();
module.exports = {
  help: {
    name: "system",
    aliases: ["levelsys"],
    description: `Enable/disable autorole system`,
    examples: [`levelsys <on/off>`],
    permissions: 'ManageMessages',
    permissionsMe: ['ManageMessages'],
    ownerOnly: false,
    file: __filename,
    arguments: [
      { name: 'boolean', description: 'enable or disable the system', required: true },
    ]
  },
  async run(bot, message, args) {

    let system = await message.options.getBoolean("boolean")

    const currentSettings = await bot.inviteServices.GetAsync(message.guild.id) || new InviteModel(message.guild.id);
    currentSettings.Enabled = system;
    const saved = await bot.inviteServices.SetAsync(currentSettings);
    switch (saved?.acknowledged ?? false) {
      case true:
        let onembed = new moduleHolder.Modules.discord.EmbedBuilder()
          .setDescription(`${system ? moduleHolder.Modules.emojie.on : moduleHolder.Modules.emojie.off} Invite system has been set to ${system}`)
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
