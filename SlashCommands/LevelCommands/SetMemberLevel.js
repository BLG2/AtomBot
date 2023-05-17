const MemberLevelModel = require("../../Models/MemberLevelModel")
const ModuleHolder = require("../../Classes/ModuleHolder")

const moduleHolder = new ModuleHolder();
module.exports = {
  help: {
    name: "set-level",
    aliases: ["level-set"],
    description: `Set somones level.`,
    examples: [`set-level <amount>`],
    permissions: 'ManageMessages',
    permissionsMe: ['none'],
    ownerOnly: false,
    file: __filename,
    arguments: [
      { name: 'user', description: 'user to set the level', required: true },
      { name: 'level_number', description: 'Level', required: false },
      { name: 'xp_number', description: 'Xp', required: false },
      { name: 'total_xp_number', description: 'TotalXp', required: false },
    ]
  },
  async run(bot, message, args) {

    let user = await message.options.getUser("user") || { id: '0000' }
    let member = await message.guild.members.cache.find(u => u.id === user.id) || null
    let level = await message.options.getInteger("level_number") || null
    let xp = await message.options.getInteger("xp_number") || null
    let totalXp = await message.options.getInteger("total_xp_number") || null
    if (!level && !xp && !totalXp) return message.followUp(`${moduleHolder.Modules.emojie.error} Pls choose at least one of the number options.`).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err);

    if (level && Number(level) <= 0) return message.followUp(`${moduleHolder.Modules.emojie.error} Pls choose a number above 0.`).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err);
    if (xp && Number(xp) <= 0) return message.followUp(`${moduleHolder.Modules.emojie.error} Pls choose a number above 0.`).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err);
    if (totalXp && Number(totalXp) <= 0) return message.followUp(`${moduleHolder.Modules.emojie.error} Pls choose a number above 0.`).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err);

    const currentSettings = await bot.levelServices.GetMemberLevelAsync(message.guild.id, member.id) || new MemberLevelModel(message.guild.id, member.id);

    if (level) currentSettings.Level = level;
    if (xp) currentSettings.Xp = xp;
    if (totalXp) currentSettings.TotalXp = totalXp;

    const saved = await bot.levelServices.SetMemberLevelAsync(currentSettings);
    switch (saved?.acknowledged ?? false) {
      case true:
        let onembed = new moduleHolder.Modules.discord.EmbedBuilder()
          .setDescription(`Succesfully set ${member} its level to: \nLevel: ${currentSettings.Level}\nXp: ${currentSettings.Xp}\nTotalXp: ${currentSettings.TotalXp}`)
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
