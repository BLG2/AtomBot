const ModuleHolder = require("../../Classes/ModuleHolder");
const moduleHolder = new ModuleHolder();

module.exports = {
  help: {
    name: "user",
    aliases: ["member", "u"],
    description: `Get some info from the given user (user need to be in a server with me)`,
    examples: [`member <option> <user>`],
    permissions: 'none',
    permissionsMe: ['none'],
    ownerOnly: false,
    file: __filename,
    arguments: [
      { name: 'option_string', description: 'info you want to get', required: true, options: ["info", "avatar", "banner"] },
      { name: 'user', description: 'User Mention.', required: false },
      { name: 'member_id_string', description: 'User ID.', required: false },
    ]
  },
  async run(bot, message, args) {
    let user = await message.options.getUser("user") || { id: await message.options.getString("member_id_string") ?? message.member.id }
    let member = await message.guild.members.cache.find(u => u.id === user.id) || await bot.users.fetch(user.id, { force: true }) || null;
    let option = await message.options.getString("option_string") || 'info'
    if (!member) return message.followUp(`Member not found.`).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err);

    switch (option) {
      case 'avatar':
        const AvatarEmbed = new moduleHolder.Modules.discord.EmbedBuilder()
          .setTitle(`${member.user.username}'s Avatar!`)
          .setImage(`${member.displayAvatarURL({ dynamic: true, size: 4096 })}`) 
          .setColor(moduleHolder.Modules.discord.Colors.Blue)
          .setFooter({ text: `${moduleHolder.Modules.private.embedFooter}`, iconURL: `${bot.user.displayAvatarURL({ extension: 'png' })}` })
        message.followUp({ embeds: [AvatarEmbed] }).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err);
        break;
      case 'banner':
        member = await bot.users.fetch(user.id, { force: true });
        if (!member.banner) return message.followUp(`Looks like this member has no banner.`).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err);
        const BannerEmbed = new moduleHolder.Modules.discord.EmbedBuilder()
          .setTitle(`${member.username}'s Banner!`)
          .setColor(moduleHolder.Modules.discord.Colors.Blue)
          .setFooter({ text: `${moduleHolder.Modules.private.embedFooter}`, iconURL: `${bot.user.displayAvatarURL({ extension: 'png' })}` })
          .setImage(`attachment://banner.gif`)
        message.followUp({
          embeds: [BannerEmbed],
          files: [{
            attachment: `https://cdn.discordapp.com/banners/${member.id}/${member.banner}?size=2048`,
            name: 'banner.gif'
          }]
        }).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err);
        break;
      case 'info':

        let Badges = member && member.user && member.user.flags ? member.user.flags.toArray() || [] : []
        let boostTime = member.premiumSinceTimestamp ? moduleHolder.Modules.moment.utc(member.premiumSinceTimestamp).format('lll') || 'Unknown' : 'Not Boosting'
        let mutualservers = await bot.guilds.cache.filter(g => g.members.cache.get(member.id)) || { size: 0 }

        let DiscordApp = []
        if (member.presence && member.presence.clientStatus.mobile) DiscordApp.push('Mobile')
        if (member.presence && member.presence.clientStatus.desktop) DiscordApp.push('Desktop')
        if (member.presence && member.presence.clientStatus.web) DiscordApp.push('Web')

        let Status = 'None'
        if (member.presence && member.presence.activities.length !== 0) {
          Status = member.presence.activities.map(a => `${a.name || ''}  ${a.state || ''}  ${a.details || ''}`).join('\n')
        }
        let StatusDot = `${moduleHolder.Modules.emojie.discord_inviseble}`
        if (member.presence && member.presence.status) {
          StatusDot = `${moduleHolder.Modules.emojie[`discord_${member.presence.status}`]}`
        }
        if (member.presence && member.presence.activities.length !== 0 && member.presence.activities[0].type === 1) {
          StatusDot = `${moduleHolder.Modules.emojie.discord_live}`
        }

        let acknowledgements = "None";
        if (member.id === message.guild.ownerId) {
          acknowledgements = "Guild Owner"
        } else if (member.bot && member.bot === true) {
          acknowledgements = "Bot"
        } else if (member.permissions && member.permissions.has(moduleHolder.Modules.discord.PermissionFlagsBits.Administrator)) {
          acknowledgements = "Guild Administrator"
        } else if (member.permissions && member.permissions.has(moduleHolder.Modules.discord.PermissionFlagsBits.ManageGuild)) {
          acknowledgements = "Guild Manager"
        } else if (member.permissions && member.permissions.has(moduleHolder.Modules.discord.PermissionFlagsBits.ManageChannels)) {
          acknowledgements = "Guild Manager"
        } else if (member.permissions && member.permissions.has(moduleHolder.Modules.discord.PermissionFlagsBits.ManageMessages)) {
          acknowledgements = "Guild Moderator"
        } else if (member.permissions && member.permissions.has(moduleHolder.Modules.discord.PermissionFlagsBits.KickMembers)) {
          acknowledgements = "Guild Moderator"
        } else if (member.permissions && member.permissions.has(moduleHolder.Modules.discord.PermissionFlagsBits.BanMembers)) {
          acknowledgements = "Guild Moderator"
        }

        let warnings = await bot.warnServices.GetAllFromUserAsync(message.guild.id, member.id) || null;
        const memberMessageCount = await bot.memberMessageCountServices.GetAsync(message.guild.id, member.id) || null;

        const InfoEmbed = new moduleHolder.Modules.discord.EmbedBuilder()
          .setTitle(`${member.user ? member.user.username : `${member.username}`}'s Info!`)
          .addFields([
            {
              name: `User Info:`, value: `
\`Is Bot\` **${member.user ? member.user.bot ? 'Yes' : 'No' : 'Unknown'}**
\`User:\` **${member.user ? member.user.tag : `${member.username}#${member.discriminator}`}**
\`Discriminator:\` **${member.user ? member.user.discriminator : member.discriminator}**
\`ID:\` **${member.id}**
\`Account Created:\` **${member.user ? moduleHolder.Modules.discordBuilder.time(member.user.createdAt, 'R') : 'Unknown'}**
\`UserStatus:\` ${StatusDot} **${DiscordApp.length > 0 ? DiscordApp.map(d => d) : "Unknown"}**
\`GameStatus:\` **${Status ?? "Unknown"}**
\`Discord Badges:\` **${Badges.length && Badges.length > 0 ? Badges.map(flag => ` \`${flag}\` `).join(', ') : 'None'}**
`},
            {
              name: `Server:`, value: `
\`Guild Messages:\` **${memberMessageCount ? memberMessageCount?.MessageCount ?? 0 : 0}**
\`Timed Out:\` **${member.communicationDisabledUntil ? `Yes, ends: ${moduleHolder.Modules.discordBuilder.time(member.communicationDisabledUntil, 'R')}` : 'No'}**
\`Boosting since:\` **${boostTime}**
\`Joined The Server:\` **${member.joinedAt ? moduleHolder.Modules.discordBuilder.time(member.joinedAt, 'R') : 'Unknown'}**
\`Acknowledgements:\` **${acknowledgements}**
\`Roles:\`  **${member.roles ? member.roles.cache.size : 0}**  ${member.roles ? ` \`Highest:\` **${member.roles.highest}**` : ''}
`},
            {
              name: `Bot:`, value: `
\`Mutual servers with bot:\` \`${mutualservers.size}\` / \`${bot.guilds.cache.size ?? 0}\`
\`Warnings:\` **Server:** \`${warnings && warnings.length > 0 ? warnings.find(w => w.WarnType == "Server")?.WarnCount ?? 0 : 0}\` | **Link:** \`${warnings && warnings.length > 0 ? warnings.find(w => w.WarnType == "Link")?.WarnCount ?? 0 : 0}\` | **MaliciousLink:** \`${warnings && warnings.length > 0 ? warnings.find(w => w.WarnType == "MaliciousLink")?.WarnCount ?? 0 : 0}\` | **Ip:** \`${warnings && warnings.length > 0 ? warnings.find(w => w.WarnType == "Ip")?.WarnCount ?? 0 : 0}\` | **Selfbot:** \`${warnings && warnings.length > 0 ? warnings.find(w => w.WarnType == "Selfbot")?.WarnCount ?? 0 : 0}\` | **Spam:** \`${warnings && warnings.length > 0 ? warnings.find(w => w.WarnType == "Spam")?.WarnCount ?? 0 : 0}\`
`}
          ])
          .setColor(moduleHolder.Modules.discord.Colors.Blue)
          .setFooter({ text: `${moduleHolder.Modules.private.embedFooter}`, iconURL: `${bot.user.displayAvatarURL({ extension: 'png' })}` })
        message.followUp({ embeds: [InfoEmbed] }).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err);
        break;
    }
  }
};


