const ServerStatsModel = require("../../Models/ServerStatsModel");
const ModuleHolder = require("../../Classes/ModuleHolder");
const moduleHolder = new ModuleHolder();
module.exports = {
  help: {
    name: "set-stats",
    aliases: ["setsts"],
    description: `Create stats channels.`,
    examples: [`stats <members>`, `stats <status>`, `stats <server>`],
    permissions: 'ManageChannels',
    permissionsMe: ['ManageChannels'],
    ownerOnly: false,
    file: __filename,
    arguments: [
      { name: 'option_string', description: 'choises', required: true, options: ["TotalMembers", "Members", "Bots", "OfflineMembers", "OnlineMembers", "IdleMembers", "DndMembers", "LiveMembers", "GuildChannelCount", "GuildRoleCount"] },
      { name: 'channel', description: 'Channel', required: true },
    ]
  },
  async run(bot, message, args) {
    let option = await message.options.getString("option_string") || "TotalMembers";
    let channel = await message.options.getChannel("channel") || null
    if (!channel) return message.followUp(`Pls provide the channel!`).catch(err => console.err);
    const currentSettings = await bot.serverStatsServices.GetAsync(message.guild.id) || new ServerStatsModel(message.guild.id);
    currentSettings[option] = channel.id;
    let stats = {
      TotalMembers: `Total Members: ${message.guild.memberCount || 0}`,
      Members: `Members: ${message.guild.members.cache.filter(m => !m.user.bot).size || 0}`,
      Bots: `Bots: ${message.guild.members.cache.filter(m => m.user.bot).size || 0}`,
      OnlineMembers: `Online Members: ${message.guild.members.cache.filter(member => member.presence && member.presence.status.toLowerCase() === "online").size || 0}`,
      OfflineMembers: `Offline Members: ${message.guild.members.cache.filter(member => member.presence && member.presence.status.toLowerCase() === "offline" || !member.presence).size || 0}`,
      IdleMembers: `Idle Members: ${message.guild.members.cache.filter(member => member.presence && member.presence.status.toLowerCase() === "idle").size || 0}`,
      DndMembers: `Dnd Members: ${message.guild.members.cache.filter(member => member.presence && member.presence.status.toLowerCase() === "dnd").size || 0}`,
      LiveMembers: `Live Members: ${message.guild.members.cache.filter(member => member.presence && member.presence.status.toLowerCase() === "live" || member.presence && member.presence.status.toLowerCase() === "streaming").size || 0}`,
      GuildRoleCount: `Guild Roles: ${message.guild.roles.cache.size - 1 || 0}`,
      GuildChannelCount: `Guild Channels: ${message.guild.channels.cache.size || 0}`
    }

    try {
      channel.setName(stats[option]);
    } catch (e) { }
    const saved = await bot.serverStatsServices.SetAsync(currentSettings);
    switch (saved?.acknowledged ?? false) {
      case true:
        let onembed = new moduleHolder.Modules.discord.EmbedBuilder()
          .setDescription(`${moduleHolder.Modules.emojie.succes} ${option} channel has been set to ${channel}`)
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


