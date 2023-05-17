const ModuleHolder = require("../../Classes/ModuleHolder");
const moduleHolder = new ModuleHolder();

module.exports = {
  help: {
    name: "warn",
    aliases: [],
    description: `Warn a user.`,
    examples: [`warn <user>`],
    permissions: 'ManageMessages',
    permissionsMe: ['ManageMessages'],
    ownerOnly: false,
    file: __filename,
    arguments: [
      { name: 'user', description: 'user to warn', required: true },
      { name: 'reason_string', description: 'reason for warn', required: false },
    ]
  },
  async run(bot, message, args) {
    let member = await message.options.getUser("user") || { id: '0000' }
    let user = await message.guild.members.cache.find(u => u.id === member.id) || null
    let reason = await message.options.getString("reason_string") || 'Not Provided'
    bot.warnServices.WarnUser(bot, "Server", "none (ServerWarn)", `You have been warned by: ${message.member.user.tag}\nReason: ${reason}`, user, message, false)
    message.followUp('Warned user.').then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 30000)).catch(err => console.err);
  }
};

