const MemberInvitesModel = require("../../Models/MemberInvitesModel")
const ModuleHolder = require("../../Classes/ModuleHolder")

const moduleHolder = new ModuleHolder();
module.exports = {
  help: {
    name: "set-invites",
    aliases: ["invites-set"],
    description: `Set somones invites.`,
    examples: [`set-invites <amount>`],
    permissions: 'ManageMessages',
    permissionsMe: ['none'],
    ownerOnly: false,
    file: __filename,
    arguments: [
      { name: 'user', description: 'user to set the invites', required: true },
      { name: 'joins_number', description: 'Joins', required: false },
      { name: 'leaves_number', description: 'Leaves', required: false },
      { name: 'fakes_number', description: 'Fakes', required: false },
      { name: 'stays_number', description: 'Stays', required: false },
    ]
  },
  async run(bot, message, args) {

    let user = await message.options.getUser("user") || { id: '0000' }
    let member = await message.guild.members.cache.find(u => u.id === user.id) || null
    let joins = await message.options.getInteger("joins_number") || null
    let leaves = await message.options.getInteger("leaves_number") || null
    let fakes = await message.options.getInteger("fakes_number") || null
    let stays = await message.options.getInteger("stays_number") || null
    if (!joins && !leaves && !fakes && !stays) return message.followUp(`${moduleHolder.Modules.emojie.error} Pls choose at least one of the number options.`).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err);

    if (joins && Number(joins) <= 0) return message.followUp(`${moduleHolder.Modules.emojie.error} Pls choose a number above 0.`).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err);
    if (leaves && Number(leaves) <= 0) return message.followUp(`${moduleHolder.Modules.emojie.error} Pls choose a number above 0.`).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err);
    if (fakes && Number(fakes) <= 0) return message.followUp(`${moduleHolder.Modules.emojie.error} Pls choose a number above 0.`).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err);
    if (stays && Number(stays) <= 0) return message.followUp(`${moduleHolder.Modules.emojie.error} Pls choose a number above 0.`).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err);

    const currentSettings = await bot.inviteServices.GetMemberInvitesAsync(message.guild.id, member.id) || new MemberInvitesModel(message.guild.id, member.id);

    if (joins) currentSettings.Joins = joins;
    if (leaves) currentSettings.Leaves = leaves;
    if (fakes) currentSettings.Fakes = fakes;
    if (stays) currentSettings.Stays = stays;

    const saved = await bot.inviteServices.SetMemberInvitesAsync(currentSettings);
    switch (saved?.acknowledged ?? false) {
      case true:
        let onembed = new moduleHolder.Modules.discord.EmbedBuilder()
          .setDescription(`Succesfully set ${member} its invites to: \nJoins: ${currentSettings.Joins}\nLeaves: ${currentSettings.Leaves}\nFakes: ${currentSettings.Fakes}\nStays: ${currentSettings.Stays}`)
          .setColor(moduleHolder.Modules.discord.Colors.Blue)
          .setFooter({ text: `${moduleHolder.Modules.private.embedFooter}`, iconURL: `${bot.user.displayAvatarURL({ extension: 'png' })}` })
        message.followUp({ embeds: [onembed] }).catch(err => console.err);
        break;
      case false:
        let errorEmbed = new moduleHolder.Modules.discord.EmbedBuilder()
          .setDescription(`${moduleHolder.Modules.emojie.error} Somthing went whrong.`)
          .setColor(moduleHolder.Modules.discord.Colors.Red)
          .setFooter({ text: `${moduleHolder.Modules.private.embedFooter}`, iconURL: `${bot.user.displayAvatarURL({ extension: 'png' })}` })
        message.followUp({ embeds: [errorEmbed] }).catch(err => console.err);
        break;
    }
  }

};
