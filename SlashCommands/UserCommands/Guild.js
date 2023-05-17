const ModuleHolder = require("../../Classes/ModuleHolder");
const moduleHolder = new ModuleHolder();

module.exports = {
  help: {
    name: "guild",
    aliases: ["server", "g"],
    description: `Get some info from the current guild.`,
    examples: [`guild <option>`],
    permissions: 'none',
    permissionsMe: ['none'],
    ownerOnly: false,
    file: __filename,
    arguments: [
      { name: 'option_string', description: 'info you want to get', required: true, options: ["info", "icon", "banner"] },
    ]
  },
  async run(bot, message, args) {
    let option = await message.options.getString("option_string") || 'info'

    switch (option) {
      case 'icon':
        const AvatarEmbed = new moduleHolder.Modules.discord.EmbedBuilder()
          .setTitle(`Guild Icon`)
          .setImage(`${message.guild.iconURL({ dynamic: true, size: 1024 })}`)
          .setColor(moduleHolder.Modules.discord.Colors.Blue)
          .setFooter({ text: `${moduleHolder.Modules.private.embedFooter}`, iconURL: `${bot.user.displayAvatarURL({ extension: 'png' })}` })
        message.followUp({ embeds: [AvatarEmbed] }).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err);
        break;
      case 'banner':
        if (!message.guild.banner) return message.followUp(`Looks like this member has no banner.`).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err);
        const BannerEmbed = new moduleHolder.Modules.discord.EmbedBuilder()
          .setTitle(`Guild Banner!`)
          .setColor(moduleHolder.Modules.discord.Colors.Blue)
          .setFooter({ text: `${moduleHolder.Modules.private.embedFooter}`, iconURL: `${bot.user.displayAvatarURL({ extension: 'png' })}` })
          .setImage(`${message.guild.bannerURL({ dynamic: true, size: 1024, extension: 'gif' })}`)
        message.followUp({
          embeds: [BannerEmbed]
        }).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err);
        break;
      case 'info':
        let verifLevels = {
          0: "None",
          1: "Low",
          2: "Medium",
          3: "(╯°□°）╯︵  ┻━┻ | High",
          4: "┻━┻ミヽ(ಠ益ಠ)ノ彡┻━┻ | Very high"
        };
        let catChannels = await message.guild.channels.cache.filter(c => c.type === 4) || []
        let txtChannels = await message.guild.channels.cache.filter(c => c.type === 0) || []
        let vceChannels = await message.guild.channels.cache.filter(c => c.type === 2) || []

        let FetchedThreads = await message.guild.channels.cache.filter(c => c.type === 12 || c.type == 11 && c.threads.cache.size !== 0) || [];

        let guildOwner = await message.guild.fetchOwner().catch(e => { }) || { displayName: 'Unknown' }
        let vanityInfo = message.guild.fetchVanityData().catch(err => console.err)
        if (!vanityInfo.code) { vanityInfo.code = 'None' }
        if (!vanityInfo.uses) { vanityInfo.uses = '0' }

        const InfoEmbed = new moduleHolder.Modules.discord.EmbedBuilder()
        InfoEmbed.setTitle(`Guild Info!`)
        InfoEmbed.addFields([{
          name: `Guild Info:`, value: `
‣ \`Server Name:\` **${message.guild.name ?? "Unknown"}**
‣ \`Server Location:\` **${message.guild.preferredLocale ?? "Unknown"}**
‣ \`Server Owner:\` **${guildOwner.displayName ?? "Unknown"}**
‣ \`Verification Level:\` **${verifLevels[message.guild.verificationLevel]}**
‣ \`AFK System:\` **${message.guild.afkChannel || 'None'}**
‣ \`SlashCommands:\` **${message.guild.commands.cache.size || 0}**
‣ \`Creation Date:\` **${moduleHolder.Modules.discordBuilder.time(message.guild.createdAt, 'R')}**
‣ \`Threads:\` ${FetchedThreads.length}
`},
        {
          name: `Premium Info:`, value: `
‣ \`Premium Tier:\` **${message.guild.premiumTier || '0'}**
‣ \`Server Boosts\` **${message.guild.premiumSubscriptionCount || '0'}**
‣ \`VanityUrlCode:\` **${vanityInfo.code}**
‣ \`VanityUrlUses:\` **${vanityInfo.uses}**
      `},
        {
          name: `Shard Info:`, value: `
‣ \`ShardID:\` **${message.guild.shardId}**
‣ \`Shard Ping:\` **${message.guild.shard.ping}ms**
‣ \`Last Pinged:\` **${message.guild.shard && message.guild.shard.lastPingTimestamp ? moduleHolder.Modules.discordBuilder.time(moduleHolder.Modules.moment(message.guild.shard.lastPingTimestamp)._d, 'R') : 'Unknown'}**
‣ \`Conected At:\` **${message.guild.shard && message.guild.shard.connectedAt ? moduleHolder.Modules.discordBuilder.time(moduleHolder.Modules.moment(message.guild.shard.connectedAt)._d, 'R') : 'Unknown'}**
      `},
        {
          name: `Stats Info:`, value: `
‣ \`Members:\` **${message.guild.memberCount}**
‣ \`Users:\` **${message.guild.members.cache.filter(m => !m.user.bot).size || 0}**
‣ \`Bots:\` **${message.guild.members.cache.filter(m => m.user.bot).size || 0}**
‣ \`Role Count:\` **${message.guild.roles.cache.size}**
‣ \`Category Channels:\` **${catChannels.size}**
‣ \`Text Channels:\` **${txtChannels.size}**
‣ \`Voice Channels:\` **${vceChannels.size}**
‣ \`Total Online Users:\` **${message.guild.members.cache.filter(member => member.presence && member.presence.status !== "offline").size || 0}**
${moduleHolder.Modules.emojie.online} **${message.guild.members.cache.filter(member => member.presence && member.presence.status === "online").size || 0}** | ${moduleHolder.Modules.emojie.offline} **${message.guild.members.cache.filter(member => member.presence && member.presence.status === "offline" || !member.presence).size || 0}** | ${moduleHolder.Modules.emojie.dnd} **${message.guild.members.cache.filter(member => member.presence && member.presence.status === "dnd").size || 0}** | ${moduleHolder.Modules.emojie.idle} **${message.guild.members.cache.filter(member => member.presence && member.presence.status === "idle").size || 0}** | ${moduleHolder.Modules.emojie.live} **${message.guild.members.cache.filter(member => member.presence && member.presence.status === "live").size || 0}**
`}
        ])
        InfoEmbed.setColor(moduleHolder.Modules.discord.Colors.Blue)
        InfoEmbed.setFooter({ text: `${moduleHolder.Modules.private.embedFooter}`, iconURL: `${bot.user.displayAvatarURL({ extension: 'png' })}` })
        message.followUp({ embeds: [InfoEmbed] }).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err);
        break;
    }
  }
};


