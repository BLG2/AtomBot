const GuessTheNumberModel = require("../../Models/GuessTheNumberModel");
const ModuleHolder = require("../../Classes/ModuleHolder")

const moduleHolder = new ModuleHolder();
module.exports = {
  help: {
    name: "settings",
    aliases: ["gtnsettings"],
    description: `Get the settings of the current guess-the-nr game`,
    examples: [`guessthenrsettings`],
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

    let Embed = new moduleHolder.Modules.discord.EmbedBuilder()
      .setTitle(`Last guess the number game settings`)
      .addFields([
        { name: `Enabled:`, value: `${currentSettings.Enabled ? 'Yes' : 'No'}` },
        { name: `Channel:`, value: `<#${currentSettings.ChannelId}>` },
        { name: `MinimumNumber:`, value: `${currentSettings.MinimumNumber ?? "Unknown"}` },
        { name: `MaximumNumber:`, value: `${currentSettings.MaximumNumber ?? "Unknown"}` },
        { name: `WinningNumber:`, value: `${currentSettings.WinningNumber ?? "Unknown"}` },
        { name: `Prize:`, value: `${currentSettings.Prize}` },
        { name: `IgnoreRoles:`, value: `${currentSettings.IgnoreRoleIds && currentSettings.IgnoreRoleIds.length > 0 ? currentSettings.IgnoreRoleIds.map(r => `<@&${r}>`) : "None"}` },
      ])
      .setColor(moduleHolder.Modules.discord.Colors.Red)
      .setFooter({ text: `${moduleHolder.Modules.private.embedFooter}`, iconURL: `${bot.user.displayAvatarURL({ extension: 'png' })}` })
    message.member.send({ embeds: [Embed] }).then(() => {
      return message.followUp({ content: `Iv sent you a dm with the current GTN settings.` }).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err);
    }).catch(err => {
      return message.followUp({ content: `Error sending DM.` }).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err);
    })
  }
};
