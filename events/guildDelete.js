const ModuleHolder = require("../Classes/ModuleHolder");

const moduleHolder = new ModuleHolder();
module.exports = async (bot, guild) => {
  if (!guild || !guild.name) return;
  try {
    const embed = new moduleHolder.Modules.discord.EmbedBuilder()
      .setTitle("Removed from server")
      .setColor(moduleHolder.Modules.discord.Colors.Blue)
      .setThumbnail("https://cdn.discordapp.com/icons/" + guild.id + "/" + guild.icon + ".png")
      .setDescription(`Bot has been removed from server: **${guild.name}**\n Server ID: **${guild.id}**\n\n Bot is in **${bot.guilds.cache.size}** servers.\n Serving **${bot.guilds.cache.reduce((a, g) => a + g.memberCount, 0)}** users.`)
      .setTimestamp();
    const messageChannel = bot.channels.cache.get("689167881635889153");
    if (messageChannel) {
      messageChannel.send({ embeds: [embed] }).catch(err => console.error);
    }
  } catch (err) {

  }
}
