const ErrorHandler = require("../../Classes/ErrorHandler");
const ModuleHolder = require("../../Classes/ModuleHolder");

const moduleHolder = new ModuleHolder();
module.exports = {
  help: {
    name: "info",
    aliases: ["inf", "infoo"],
    description: `Get some info and usage about the mentioned command`,
    examples: [`info <command name>`],
    permissions: 'none',
    permissionsMe: ['none'],
    ownerOnly: false,
    file: __filename,
    arguments: [
      { name: 'category_name', description: 'Category Name', required: true },
      { name: 'command_name', description: 'Command Name', required: true },
    ]
  },
  async run(bot, message, args) {
    try {


      let categoryToFetch = await message.options.getString("category_name") || null
      let commandToFetch = await message.options.getString("command_name") || null

      if (commandToFetch) {
        const commandFile = await bot.SlashCommands.get(`${categoryToFetch.toLowerCase()}-${commandToFetch.toLowerCase()}`) || null
        if (commandFile) {
          let commandName = `Unknown`,
            commandUsage = 'Unknown',
            commandDescription = 'Unknown',
            UserPerms = 'None',
            BOTPerms = 'None'

          if (commandFile.help.name) { commandName = commandFile.help.name }
          if (commandFile.help.examples && commandFile.help.examples.length !== 0) { commandUsage = commandFile.help.examples.join(`\n/`) }
          if (commandFile.help.description) { commandDescription = commandFile.help.description }

          if (commandFile.help.permissions.toLowerCase() !== 'none') { UserPerms = commandFile.help.permissions || 'None' }

          let botpermData = [];
          let permissionsMe = commandFile.help.permissionsMe || ['none']
          await permissionsMe.forEach(perm => {
            if (perm.toLowerCase() !== 'none') {
              botpermData.push(perm)
            }
          });
          if (botpermData.length !== 0) { BOTPerms = botpermData.join('\n') }

          var embed2 = new moduleHolder.Modules.discord.EmbedBuilder()
            .addFields([
              { name: `Command Name:`, value: `\`${commandName ?? "Unknown"}\`` },
              { name: `Required User Pemrs:`, value: `\`${UserPerms ?? "Unknown"}\`` },
              { name: `Required BOT Pemrs:`, value: `\`${BOTPerms ?? "Unknown"}\`` },
              { name: `Command Description:`, value: `\`${commandDescription ?? "Unknown"}\`` }
            ])

          message.followUp({ embeds: [embed2] }).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err);
        } else {
          return message.followUp(`Could not find the metnioned commandName.`).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err);
        }
      } else {
        return message.followUp(`Pls mention an commandName`).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err);
      }

    } catch (err) {
      throw new ErrorHandler(err);
    }
  }
};

