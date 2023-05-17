const ModuleHolder = require("../../Classes/ModuleHolder");
const moduleHolder = new ModuleHolder();

module.exports = {
  help: {
    name: "reroll",
    aliases: ["gvw-reroll"],
    description: `Reroll an ended giveaway.`,
    examples: [`giveaway-reroll <msgID>`],
    permissions: 'ManageMessages',
    permissionsMe: ['none'],
    ownerOnly: false,
    file: __filename,
    arguments: [
      { name: 'message_id_string', description: 'The giveaway message ID', required: true },
      { name: 'winners_number', description: 'Winners count for the giveaway', required: false },
    ]
  },
  async run(bot, message, args) {
    let messageID = await message.options.getString("message_id_string") || null;


    let fetchedGiveaway = await bot.giveawayServices.GetAsync(message.guild.id, messageID) || null;
    if (!fetchedGiveaway) return message.followUp(`There is no giveaway with message id: ${messageID}`)
    // if (giveawayMessage.Ended == false) return message.followUp(`Giveaway is stil active.`)

    let giveawayMessage = await message.guild.channels.cache.get(fetchedGiveaway?.ChannelId ?? "000")?.messages.fetch(messageID).catch(e => { }) || null
    if (!giveawayMessage) return message.followUp(`Giveaway message not found.`)
    if (fetchedGiveaway.Attendees.length <= 0) return message.followUp(`Looks like there no attendees in this giveaway.`)


    let winnerCount = await message.options.getInteger("winners_number") || fetchedGiveaway.Winners

    let PplEntered = []
    let winners = []
    await fetchedGiveaway.Attendees.map(async user => {
      let member = await message.guild.members.cache.get(user) || null;
      if (member !== null && !member.roles.cache.filter(role => fetchedGiveaway.ExcludeRoleIds.includes(role.id)).some(x => x)) { PplEntered.push(member.id) }
    })
    if (Number(PplEntered.length) < winnerCount) {
      return message.followUp(`${moduleHolder.Modules.emojie.error} Looks like there not enough entries to chose ${winnerCount} winners!`).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err);
    } else {
      for (var i = 0; i < winnerCount; i++) {
        inList = false;
        random = Math.floor(Math.random() * PplEntered.length);
        for (var y = 0; y < winners.length; y++) {
          if (winners[y] === PplEntered[random]) {
            i--;
            inList = true;
            break;
          }
        }
        if (!inList) {
          winners.push(PplEntered[random]);
        }
      }

      let editEmbed = new moduleHolder.Modules.discord.EmbedBuilder()
        .setTitle(`Giveaway Ended!`)
        .setDescription(`**Prize:** \`${fetchedGiveaway.Prize}\`\n**Winners:**\n${winners.map(w => `<@${w}>`).join('\n')}\n\nGiveaway ended with ${PplEntered.length} entrie(s).`)
        .setFooter({ text: `Giveaway sys`, iconURL: `${bot.user.displayAvatarURL({ extension: 'png' })}` })
      giveawayMessage.edit({ embeds: [editEmbed], "components": [] }).catch(e => { })
      let winnersEmbed = new moduleHolder.Modules.discord.EmbedBuilder()
        .setDescription(`[**Congrats You won the giveaway!**](https://discord.com/channels/${message.guild.id}/${fetchedGiveaway.ChannelId}/${fetchedGiveaway.MessageId})`)
      giveawayMessage.reply({
        content: `${winners.map(w => `<@${w}>`).join('\n')}`,
        embeds: [winnersEmbed]
      });
      for (var i = 0; i < winners.length; i++) {
        let dmUser = await message.guild.members.cache.get(winners[i]) || null;
        if (dmUser !== null) {
          let winnersEmbed = new moduleHolder.Modules.discord.EmbedBuilder()
            .setDescription(`**Congrats** You won the giveaway **${fetchedGiveaway.Prize}**. ${moduleHolder.Modules.emojie.giveaway2}${moduleHolder.Modules.emojie.giveaway2}\nGet your prize in server: **${message.guild.name}** befor your to late!\n\n[Giveaway message url](https://discord.com/channels/${message.guild.id}/${fetchedGiveaway.ChannelId}/${fetchedGiveaway.MessageId})`)
          dmUser.send({ embeds: [winnersEmbed] }).catch(err => console.err)
        }
      }
      if (fetchedGiveaway.LogChannelId && fetchedGiveaway.LogChannelId != "000") {
        let logChannel = message.guild.channels.cache.get(fetchedGiveaway?.LogChannelId ?? "000").catch(e => { }) || null;
        let embed = new moduleHolder.Modules.discord.EmbedBuilder()
          .setColor(moduleHolder.Modules.discord.Colors.Blue)
          .setAuthor({ name: `Giveaway has been rerolled!`, iconURL: `${bot.user.displayAvatarURL({ extension: 'png' })}`, url: `https://discord.com/channels/${message.guild.id}/${fetchedGiveaway.ChannelId}/${fetchedGiveaway.MessageId}` })
          .addFields([{ name: `Executor:`, value: `${message.member} | ${message.member.user.tag}` }])
        try { logChannel?.send({ embeds: [embed] }).catch(err => { }); } catch (e) { }
      }
    }


    let rembed = new moduleHolder.Modules.discord.EmbedBuilder()
      .setColor(moduleHolder.Modules.discord.Colors.Blue)
      .setDescription(`[**Rerolled giveaway!**](https://discord.com/channels/${message.guild.id}/${fetchedGiveaway.ChannelId}/${fetchedGiveaway.MessageId})`)
    message.followUp({ embeds: [rembed] }).catch(e => console.e)

  }
};
