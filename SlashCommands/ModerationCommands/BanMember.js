const ModuleHolder = require("../../Classes/ModuleHolder");
const moduleHolder = new ModuleHolder();
module.exports = {
  help: {
    name: "ban-unban-user",
    aliases: ["banuser"],
    description: `Ban a user from the server.`,
    examples: [`ban <@user> <reason>`],
    permissions: 'BanMembers',
    permissionsMe: ['BanMembers'],
    ownerOnly: false,
    file: __filename,
    arguments: [
      { name: 'option_string', description: 'add or remove', required: true, options: ["add", "remove"] },
      { name: 'member_id_string', description: 'User ID.', required: false },
      { name: 'user', description: 'User Mention.', required: false },
      { name: 'reason_string', description: 'Ban reason', required: false },
    ]
  },
  async run(bot, message, args, options, isSlash) {
    let option = await message.options.getString("option_string") || 'add'
    let reason = await message.options.getString("reason_string") || 'No reason provided'

    let user = await message.options.getUser("user") || { id: await message.options.getString("member_id_string") } || { id: '0000' }
    let member = await message.guild.members.cache.find(u => u.id === user.id) || await bot.users.cache.get(user.id) || null

    switch (option) {
      case "add":
        if (!member) return message.followUp("Invalid user.").then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err);
        if (member && member.permissions && member.permissions.has(moduleHolder.Modules.discord.PermissionFlagsBits.BanMembers)) return message.followUp(`${moduleHolder.Modules.emojie.no} This user can not be banned. ${moduleHolder.Modules.emojie.no}`).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err)

        message.guild.members.ban(member.id, {
          reason: reason,
        }).then(banned => {
          let banEmbed = new moduleHolder.Modules.discord.EmbedBuilder()
            .setTitle("User Banned ")
            .setColor(moduleHolder.Modules.discord.Colors.Blue)
            .addFields([
              { name: `Executor:`, value: `${message.member} | ${message.member.user.tag}` },
              { name: `Target:`, value: `${banned && banned.tag ? banned.tag : member ?? "Unknown"}` },
              { name: `Reason:`, value: `${reason ? reason : 'Unknown'}` }
            ])
            .setImage(`https://imgur.com/c4YNwUJ.gif`)
            .setFooter({ text: `${moduleHolder.Modules.private.embedFooter}`, iconURL: `${bot.user.displayAvatarURL({ extension: 'png' })}` })
          message.followUp({ embeds: [banEmbed] }).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err);
        }).catch(err => message.followUp(`Error -> ${err}`).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err))
        break;
      case "remove":
        if (!user || user.id) return message.followUp("Invalid user id.").then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err);
        await message.guild.bans.fetch().then(async bans => {
          let foundUser = await bans && bans.size !== 0 ? bans.find(u => u.user.id === user.id) || null : null
          if (!foundUser) {
            return message.followUp(`This user is not banned in this server.`).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err);
          } else {
            let banEmbed = new moduleHolder.Modules.discord.EmbedBuilder()
              .setTitle("User UnBanned")
              .setColor(moduleHolder.Modules.discord.Colors.Blue)
              .addFields([
                { name: `Executor:`, value: `${message.member} | ${message.member.user.tag}` },
                { name: `Target:`, value: `${foundUser && foundUser.user && foundUser.user.tag ? foundUser.user.tag : user.id}` },
              ])
              .setImage(`https://imgur.com/peYCiLK.gif`)
              .setFooter({ text: `${moduleHolder.Modules.private.embedFooter}`, iconURL: `${bot.user.displayAvatarURL({ extension: 'png' })}` })
            message.guild.members.unban(foundUser.user.id).catch(err => console.err);
            message.followUp({ embeds: [banEmbed] }).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err);
          }
        });
        break;
    }




  }
};
