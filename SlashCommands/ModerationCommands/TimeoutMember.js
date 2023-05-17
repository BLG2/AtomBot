const ModuleHolder = require("../../Classes/ModuleHolder");
const ValidatorHelperService = require("../../Services/ValidatorHelperService");
const moduleHolder = new ModuleHolder();
const validator = new ValidatorHelperService();
module.exports = {
  help: {
    name: "timeout-user",
    aliases: ["timeout-user"],
    description: `Timeout the mentioned user.`,
    examples: [`timeout <@user> <reason>`, `mute temp <@user> <time> <reason>`],
    permissions: 'ModerateMembers',
    permissionsMe: ['ModerateMembers'],
    ownerOnly: false,
    file: __filename,
    arguments: [
      { name: 'option_string', description: 'add or remove', required: true, options: ["add", "remove"] },
      { name: 'user', description: 'user to mute', required: true },
      { name: 'time_string', description: 'time to timeout the user', required: false },
      { name: 'reason_string', description: 'reason for mute', required: false },
    ]
  },
  async run(bot, message, args, options, isSlash) {
    let option = await message.options.getString("option_string") || 'add'
    let user = await message.options.getUser("user") || { id: await message.options.getString("member_id_string") } || { id: '0000' }
    let member = await message.guild.members.cache.find(u => u.id === user.id) || null

    let reason = await message.options.getString("reason_string") || 'Not Provided'
    let timeString = await message.options.getString("time_string") || '1h'

    if (!validator.TimeStringToMsTime(timeString)) return message.followUp("Invalid timestring.").then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err);
    let msTime = validator.TimeStringToMsTime(timeString);
    if (!validator.IsTimeBetweenTmeFrames(0, msTime + 100, msTime)) return message.followUp("Invalid timestring.").then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err);

    if (!member) return message.followUp("Invalid user.").then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err);
    if (member && member.permissions && member.permissions.has(moduleHolder.Modules.discord.PermissionFlagsBits.BanMembers)) return message.followUp(`${moduleHolder.Modules.emojie.no} This user can not be banned. ${moduleHolder.Modules.emojie.no}`).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err)

    let isTimedOut = member.isCommunicationDisabled() || false;

    switch (option) {
      case "add":
        if (member.permissions.has(moduleHolder.Modules.discord.PermissionFlagsBits.ModerateMembers) || member.permissions.has(moduleHolder.Modules.discord.PermissionFlagsBits.Administrator)) return message.followUp(`You cannot mute someone with the same permissions as you!`).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err);
        if (isTimedOut === true) return message.followUp(`This user is already timed out!`).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err)
        member.timeout(msTime, `${reason}`).then(timedOut => {
          let Embed = new moduleHolder.Modules.discord.EmbedBuilder()
            .setTitle("User TimeOut")
            .setColor(moduleHolder.Modules.discord.Colors.Blue)
            .addFields([
              { name: `Executor:`, value: `${message.member} | ${message.member.user.tag}` },
              { name: `Target:`, value: `${timedOut && timedOut.tag ? timedOut.tag : member}` },
              { name: `Reason:`, value: `${reason ? reason : 'Unknown'}` },
              { name: `Planned Un TimeOut:`, value: `${moduleHolder.Modules.discordBuilder.time(timedOut.communicationDisabledUntil, 'R')}` }
            ])
            .setFooter({ text: `${moduleHolder.Modules.private.embedFooter}`, iconURL: `${bot.user.displayAvatarURL({ extension: 'png' })}` })
          message.followUp({ embeds: [Embed] }).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err);
        }).catch(err => message.followUp(`Error -> ${err}`).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err))
        break;
      case "remove":
        if (isTimedOut === false) return message.followUp(`This user is not timed out!`).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err)
        member.timeout(null).then(timedOut => {
          let Embed = new moduleHolder.Modules.discord.EmbedBuilder()
            .setTitle("User Un-TimeOut")
            .setColor(moduleHolder.Modules.discord.Colors.Blue)
            .addFields([
              { name: `Executor:`, value: `${message.member} | ${message.member.user.tag}` },
              { name: `Target:`, value: `${timedOut && timedOut.tag ? timedOut.tag : member}` },
            ])
            .setFooter({ text: `${moduleHolder.Modules.private.embedFooter}`, iconURL: `${bot.user.displayAvatarURL({ extension: 'png' })}` })
          message.followUp({ embeds: [Embed] }).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err);
        }).catch(err => message.followUp(`Error -> ${err}`).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err))

        break;
    }




  }
};
