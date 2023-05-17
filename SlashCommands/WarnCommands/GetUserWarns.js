const ModuleHolder = require("../../Classes/ModuleHolder");
const moduleHolder = new ModuleHolder();

module.exports = {
  help: {
    name: "list",
    aliases: [],
    description: `Get a user its warning counts.`,
    examples: [`list <user>`],
    permissions: 'ManageMessages',
    permissionsMe: ['ManageMessages'],
    ownerOnly: false,
    file: __filename,
    arguments: [
      { name: 'user', description: 'user', required: true },
    ]
  },
  async run(bot, message, args) {
    let member = await message.options.getUser("user") || { id: '0000' }
    let user = await message.guild.members.cache.find(u => u.id === member.id) || null
    let userWarns = await bot.warnServices.GetAllFromUserAsync(message.guild.id, user.id) || null;
    const Embed = new moduleHolder.Modules.discord.EmbedBuilder()
    Embed.setTitle(`${user.user.tag}'s warnings`)
    Embed.setColor(moduleHolder.Modules.discord.Colors.Blue)
    if (userWarns && userWarns.length > 0) {
      Embed.addFields([]);
      await userWarns.map(w => Embed.data.fields.push({ name: `${w.WarnType} Warnings`, value: w.WarnCount }))
    } else {
      Embed.setDescription(`This user has no warnings.`)
    }
    message.followUp({ embeds: [Embed] }).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err);
  }
};

