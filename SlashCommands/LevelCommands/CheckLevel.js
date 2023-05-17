const MemberLevelModel = require("../../Models/MemberLevelModel")
const ModuleHolder = require("../../Classes/ModuleHolder")
const moduleHolder = new ModuleHolder();

module.exports = {
  help: {
    name: "check",
    aliases: ["level", "my-level"],
    description: `Shows your curent level status from the tagged user.`,
    examples: [`rank <@user>`],
    permissions: 'none',
    permissionsMe: ['none'],
    ownerOnly: false,
    file: __filename,
    arguments: [
      { name: 'user', description: 'The user to add or remove levels.', required: false },
    ]
  },
  async run(bot, message, args) {

    let user = await message.options.getUser("user") || { id: '0000' }
    let member = await message.guild.members.cache.find(u => u.id === user.id) || message.member
    if (!member) return message.followUp(`${moduleHolder.Modules.emojie.error} Could not find this memeber!`).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err);
    const memberLevel = await bot.levelServices.GetMemberLevelAsync(message.guild.id, member.id) || new MemberLevelModel(message.guild.id, member.id);

    let embed = new moduleHolder.Modules.discord.EmbedBuilder()
    embed.setDescription(`Rank for **${member.user.tag}**`)
    embed.addFields([
      { name: "Level", value: `${memberLevel.Level ?? "Unknown"}` },
      { name: "Xp", value: `${memberLevel.Xp ?? "Unknown"}` },
      { name: "TotalXp", value: `${memberLevel.TotalXp ?? "Unknown"}` }
    ])

    embed.setColor(moduleHolder.Modules.discord.Colors.Blue)
    embed.setFooter({ text: `${moduleHolder.Modules.private.embedFooter}`, iconURL: `${bot.user.displayAvatarURL({ extension: 'png' })}` })
    message.followUp({ embeds: [embed] }).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err);

  }
};
