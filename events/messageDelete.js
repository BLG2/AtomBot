const AntiSystemModel = require("../Models/AntiSystemModel");
const ModuleHolder = require("../Classes/ModuleHolder");

const moduleHolder = new ModuleHolder();
module.exports = async (bot, message) => {
  if (!message || !message.member || !message.guild || message.channel.type === 1) return;
  const antiSystemSettings = await bot.antiSystemServices.GetAsync(message.guild?.id ?? null) || new AntiSystemModel(message.guild.id);
  const isInExcludeRole = message.member.roles.cache.filter(role => antiSystemSettings.ExcludeRoleIds.includes(role.id)).some(x => x);

  //Anti Ghost Ping
  if (message.author.bot == false && antiSystemSettings && antiSystemSettings.AntiGhostPing == true) {
    if (message.content.includes('<@') || message.content.includes('@here') || message.content.includes('@everyone')) {
      let msgMaxTime = message.createdTimestamp + 60000
      if (Date.now() < msgMaxTime) {
        let tagReggex = /(<@(.?)(?:[0-9](?:[0-9-]{0,25}[0-9]))>)|(@here)|(@everyone)/g
        let tag = await message.content.match(tagReggex) || []

        let ghostMsgUser = message.guild.members.cache.get(message.author.id) || 'Unknown';
        let ghostEmbed = new moduleHolder.Modules.discord.EmbedBuilder()
          .setAuthor({ name: `Ghost ping detected!`, iconURL: message.member.user.displayAvatarURL({ dynamic: true }) })
          .setDescription(`**Send by**:\n${ghostMsgUser.user.tag} | ${ghostMsgUser}\n**Mention**:\n${tag.length > 0 ? tag.map(t => t) : 'Unknown'}`)
          .setColor(moduleHolder.Modules.discord.Colors.Blue)
        message.channel.send({ embeds: [ghostEmbed] }).catch(error => console.err);

      }
    }
  }



}
