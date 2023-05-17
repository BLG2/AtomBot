const ModuleHolder = require("../../Classes/ModuleHolder");
const moduleHolder = new ModuleHolder();
module.exports = {
  help: {
    name: "role-info",
    aliases: ["ri"],
    description: `Get some info about the mentioned role`,
    examples: [`roleinfo <@role>`],
    permissions: 'none',
    permissionsMe: ['none'],
    ownerOnly: false,
    file: __filename,
    arguments: [
      { name: 'role', description: 'Role mention.', required: true },
    ]
  },
  async run(bot, message, args) {

      let role = await message.options.getRole("role") || null
      let success = new moduleHolder.Modules.discord.EmbedBuilder()
        .setTitle(`Role info ${role.name}`)
        .addFields([
          { name: "Role Name", value: `${role.name ?? "Unknown"}` },
          { name: "Role ID", value: `${role.id ?? "Unknown"}` },
          { name: "Hex Color", value: `${role.hexColor ?? "Unknown"}` },
          { name: "Mentionable?", value: `${role.mentionable ?? "Unknown"}` },
          { name: "Position", value: `${role.position ?? "Unknown"}` }
        ])
        .setColor(`${role.hexColor}`)
        .setFooter({ text: `${moduleHolder.Modules.private.embedFooter}`, iconURL: `${bot.user.displayAvatarURL({ extension: 'png' })}` })
        message.followUp({ embeds: [success] }).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err);

  }

};

