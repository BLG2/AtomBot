const ErrorHandler = require("../../Classes/ErrorHandler");
const ModuleHolder = require("../../Classes/ModuleHolder");

const moduleHolder = new ModuleHolder();
module.exports = {
  help: {
    name: "help",
    aliases: ["hlp", "helpp", "h", "Help", "H"],
    description: `Get a list with the help commands`,
    examples: [`helpmenu`],
    permissions: 'none',
    permissionsMe: ['none'],
    ownerOnly: false,
    file: __filename,
    arguments: []
  },
  async run(bot, message, args) {
    try {

      let footer = `Requested by: ${message.member.user.username}#${message.member.user.discriminator} | AtomWidget`;
      let color = `RANDOM`;

      let emotes = {
        "SelfRoleCommands": "908721204184113224",
        "GiveawayCommands": "908721204209270805",
        "AntiSystemCommands": "908721204322521108",
        "HelpCommands": "908721204423184394",
        "WarnCommands": "908721204481904640",
        "apicommands": "908721204481904640",
        "LevelCommands": "908721204502868018",
        "WelcomeLeaveCommands": "908721204548997201",
        //"serverbackup": "908721204574187550",
        "AutoRoleCommands": "908721204574191666",
        "InviteCommands": "908721204632883250",
        "UserCommands": "908721204909719643",
        "ServerStatsCommands": "908721205228482591",
        "TicketCommands": "908721205488533524",
        "VerificationCommands": "908721205618548807",
        "ModerationCommands": "908721205685653555",
        "GuessTheNumberCommands": "908721206017015888",
        //'music': '911947363273285642',
        //'youtube': '963533280714588191',
      }

      await moduleHolder.Modules.fs.readdir(`./SlashCommands/`, async (err, files) => {
        if (files) {

          let Selection1 = new moduleHolder.Modules.discord.StringSelectMenuBuilder()
            .setCustomId(`HelpMenu_${message.guild.id}`)
            .setMaxValues(1)
            .setMinValues(0)
            .setPlaceholder('Help Selection');

          await Selection1.addOptions({
            "label": `EmptySlot`,
            "value": `EmptySlot`,
          })
          await Selection1.addOptions({
            "label": `All`,
            "value": `AllCmds`,
            "description": `All commands`,
            "emoji": '908727037232033842'
          })


          await files.map(async (folder) => {
            if (folder && folder.toLocaleLowerCase() !== 'owneronly') {
              await Selection1.addOptions({
                "label": folder,
                "value": folder,
                "description": `${folder} commands`,
                "emoji": emotes[folder]
              })
            }
          })

          let MenuEmbed = new moduleHolder.Modules.discord.EmbedBuilder()
            .setColor(moduleHolder.Modules.discord.Colors.Blue)
            .setAuthor({ name: "Help Menu", iconURL: bot.user.displayAvatarURL() })
            .setDescription(`**Command Folders:** \`${files.length}\`\n**Total Commands:** \`${(bot.SlashCommands.size).toLocaleString()}\`\n**Api Latency:** \`${Math.round(bot.ws.ping)}ms\`\n[Invite](https://discord.com/api/oauth2/authorize?client_id=${bot.user.id}&permissions=8&scope=applications.commands%20bot) | [Support](https://discord.gg/uSEMPyEDKy)`)
            .setFooter({ text: `Note: iv a 3sec cooldown on every command!` })
          message.followUp({
            embeds: [MenuEmbed],
            "components": [{ "type": 1, "components": [Selection1] }]
          }).catch(e => console.log(e.stack))

        } else {
          return message.followUp(`Could not find any folders!`).catch(e => console.e)
        }
      })

    } catch (err) {
      throw new ErrorHandler(err);
    }
  }
}
