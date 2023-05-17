const ModuleHolder = require("../../Classes/ModuleHolder");
const moduleHolder = new ModuleHolder();
module.exports = {
  help: {
    name: "channelinfo",
    aliases: ["ci"],
    description: `I wil display some info from the mentioned channel`,
    examples: [`channelinfo <#channel>`],
    permissions: 'none',
    permissionsMe: ['none'],
    ownerOnly: false,
    file: __filename,
    arguments: [
      { name: 'channel', description: 'Channel Mention.', required: false },
    ]
  },
  async run(bot, message, args) {

    let channel = await message.options.getChannel("channel") || message.channel
    let threads = channel.threads.cache.map(t => t.name).join(', ')
    const embed = new moduleHolder.Modules.discord.EmbedBuilder()
      .setTitle(`${channel.name} Info`)
      .addFields([
        { name: "Position", value: `${channel.position ?? "Unknown"}` },
        { name: "Channel ID", value: `${channel.id ?? "Unknown"}` },
        { name: "Category Name", value: `${channel.parent ?? "Unknown"}` },
        { name: "Category ID", value: `${channel.parentId ?? "Unknown"}` },
        { name: "Text Type", value: `${channel.type ?? "Unknown"}` },
        { name: "Created At", value: `${channel.createdAt ?? "Unknown"}` },
        { name: "Threads", value: `${channel.threads.cache.size} ${channel.threads.cache.size > 0 ? `-> ${threads}` : "None"}` }
      ])
      .setColor(moduleHolder.Modules.discord.Colors.Blue)
      .setFooter({ text: `${moduleHolder.Modules.private.embedFooter}`, iconURL: `${bot.user.displayAvatarURL({ extension: 'png' })}` })
    message.followUp({ embeds: [embed] }).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err);

  }
};
