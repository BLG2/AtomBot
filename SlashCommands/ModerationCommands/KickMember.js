const ModuleHolder = require("../../Classes/ModuleHolder");
const moduleHolder = new ModuleHolder();
module.exports = {
  help: {
    name: "kick-user",
    aliases: [],
    description: `Kick a user from the server.`,
    examples: [`Kick <@user> <reason>`],
    permissions: 'KickMembers',
    permissionsMe: ['KickMembers'],
    ownerOnly: false,
    file: __filename,
    arguments: [
      { name: 'member_id_string', description: 'User ID.', required: false },
      { name: 'user', description: 'User Mention.', required: false },
      { name: 'reason_string', description: 'Ban reason', required: false },
    ]
  },
  async run(bot, message, args, options, isSlash) {
    let reason = await message.options.getString("reason_string") || 'No reason provided'

    let user = await message.options.getUser("user") || { id: await message.options.getString("member_id_string") } || { id: '0000' }
    let member = await message.guild.members.cache.find(u => u.id === user.id) || await bot.users.cache.get(user.id) || null

    if (!member) return message.followUp("Invalid user.").then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err);
    if (member && member.permissions && member.permissions.has(moduleHolder.Modules.discord.PermissionFlagsBits.BanMembers)) return message.followUp(`${moduleHolder.Modules.emojie.no} This user can not be banned. ${moduleHolder.Modules.emojie.no}`).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err)

    member.kick(reason).then(kicked => {
      let kickEmbed = new moduleHolder.Modules.discord.EmbedBuilder()
        .setTitle("User Kicked ")
        .setColor(moduleHolder.Modules.discord.Colors.Blue)
        .addFields([
          { name: `Executor:`, value: `${message.member} | ${message.member.user.tag}` },
          { name: `Target:`, value: `${kicked && kicked.tag ? kicked.tag : member}` },
          { name: `Reason:`, value: `${reason ? reason : 'Unknown'}` }
        ])
        .setImage(`https://imgur.com/klE3fet.gif`)
        .setFooter({ text: `${moduleHolder.Modules.private.embedFooter}`, iconURL: `${bot.user.displayAvatarURL({ extension: 'png' })}` })
      message.followUp({ embeds: [kickEmbed] }).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err);
    }).catch(err => message.followUp(`Error -> ${err}`).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err))

  }
};
