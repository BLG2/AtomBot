const ModuleHolder = require("../Classes/ModuleHolder");

const moduleHolder = new ModuleHolder();
module.exports = async (bot, guild) => {
  if (!guild || !guild.name) return;
  try {
    let botcount = await guild.members.cache.filter(m => m.user.bot) || { size: 0 }
    if (botcount.size > 200) {
      await bot.guilds.cache.get(guild.id).leave().then(async s => {
        let embedToSend = new moduleHolder.Modules.discord.EmbedBuilder()
          .setTitle(`Left guild cause it has over 200 bots`)
          .setThumbnail("https://cdn.discordapp.com/icons/" + guild.id + "/" + guild.icon + ".png")
          .setDescription(`Server Bot Count: ${botcount.size}! \n\nServer: **${guild.name}**\nServer Owner: **${guildOwner.displayName}**\nServer ID: **${guild.id}**`);
        const logChannel = bot.channels.cache.get("689167881635889153")
        if (logChannel) {
          return logChannel.send({ embeds: [embedToSend] }).catch(err => console.error);
        }
      }).catch(e => console.log(e.stack))
    }

    let guildOwner = await guild.fetchOwner().catch(e => { }) || { displayName: 'Unknown' }
    let embedToSend = new moduleHolder.Modules.discord.EmbedBuilder()
    let time = moduleHolder.Modules.moment(guild.createdAt) || new Date();
    embedToSend.setTitle("Added to server")
    embedToSend.setColor(moduleHolder.Modules.discord.Colors.Blue)
    embedToSend.setThumbnail("https://cdn.discordapp.com/icons/" + guild.id + "/" + guild.icon + ".png")
    embedToSend.setDescription(`Bot has been added to server: **${guild.name}**\nServer Owner: **${guildOwner.displayName}**\nServer ID: **${guild.id}**\nCreation Date **${moduleHolder.Modules.discordBuilder.time(time._d, 'R')}**\nServer Location **${guild.preferredLocale}**\nMember Count: **${guild.memberCount}**\n\n Bot is in **${bot.guilds.cache.size}** servers.\n Serving **${bot.guilds.cache.reduce((a, g) => a + g.memberCount, 0)}** users.`)
    embedToSend.setTimestamp();
    const logChannel = bot.channels.cache.get("689167881635889153")
    if (logChannel) {
      return logChannel.send({ embeds: [embedToSend] }).catch(err => console.error);
    }
  } catch (err) {

  }

}
