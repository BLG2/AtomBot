const ModuleHolder = require("../../Classes/ModuleHolder");
const moduleHolder = new ModuleHolder();

module.exports = {
  help: {
    name: "end",
    aliases: ["gvw-end"],
    description: `End an active giveaway.`,
    examples: [`giveaway-end <msgID>`],
    permissions: 'ManageMessages',
    permissionsMe: ['none'],
    ownerOnly: false,
    file: __filename,
    arguments: [
      { name: 'message_id_string', description: 'The giveaway message ID', required: true },
    ]
  },
  async run(bot, message, args) {
    let messageID = await message.options.getString("message_id_string") || "00";

    let fetchedGiveaway = await bot.giveawayServices.GetAsync(message.guild.id, messageID) || null;
    if (!fetchedGiveaway) return message.followUp(`There is no giveaway with message id: ${messageID}`)
    let giveawayMessage = await message.guild.channels.cache.get(fetchedGiveaway?.ChannelId ?? "000")?.messages.fetch(messageID).catch(e => { }) || null
    if (!giveawayMessage) return message.followUp(`Giveaway message not found.`)

    if (giveawayMessage.Ended == true) return message.followUp(`Giveaway already ended.`)

    fetchedGiveaway.Time = Date.now();
    //fetchedGiveaway.Ended = true;

    let gvwDate = fetchedGiveaway.Time
    let gvwFormatDate = moduleHolder.Modules.moment(gvwDate)
    let relative = `${gvwFormatDate}`
    if (gvwFormatDate) {
      relative = moduleHolder.Modules.discordBuilder.time(gvwFormatDate._d, 'R') || ''
    }

    let embed = new moduleHolder.Modules.discord.EmbedBuilder()
      .setTitle(`${moduleHolder.Modules.emojie.giveaway} GIVEAWAY ${moduleHolder.Modules.emojie.giveaway}`)
      .setColor(moduleHolder.Modules.discord.Colors.Blue)
      .setDescription(`
\`Prize:\`  ${fetchedGiveaway.Prize}
\`Winner(s):\`  ${fetchedGiveaway.Winners}
\`Reaming Time:\`  ${relative}

\`Note:\`  ${fetchedGiveaway.Note}`)
      .setFooter({ text: `Giveaway sys`, iconURL: `${bot.user.displayAvatarURL({ extension: 'png' })}` })

    await giveawayMessage.edit({
      embeds: [embed]
    }).then(async (msg) => {
      let started = await bot.giveawayServices.UpdateAsync(fetchedGiveaway) || null;
      switch (started?.acknowledged ?? false) {
        case true:
          let embed = new moduleHolder.Modules.discord.EmbedBuilder()
            .setColor(moduleHolder.Modules.discord.Colors.Blue)
            .setDescription(`Succesfully Updated [giveaway](https://discord.com/channels/${message.guild.id}/${fetchedGiveaway.ChannelId}/${msg.id}), it should end in a minute.`)
          message.followUp({ embeds: [embed] }).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err);

          if (fetchedGiveaway.LogChannelId && fetchedGiveaway.LogChannelId != "000") {
            let logChannel = message.guild.channels.cache.get(fetchedGiveaway?.LogChannelId ?? "000").catch(e => { }) || null;
            let embed = new moduleHolder.Modules.discord.EmbedBuilder()
              .setColor(moduleHolder.Modules.discord.Colors.Blue)
              .setAuthor({ name: `Giveaway has been ended!`, iconURL: `${bot.user.displayAvatarURL({ extension: 'png' })}`, url: `https://discord.com/channels/${message.guild.id}/${fetchedGiveaway.ChannelId}/${msg.id}` })
              .addFields([{ name: `Executor:`, value: `${message.member} | ${message.member.user.tag}` }])
            try { logChannel?.send({ embeds: [embed] }).catch(err => { }); } catch (e) { }
          }
          break;
        case false:
          let errorEmbed = new moduleHolder.Modules.discord.EmbedBuilder()
            .setDescription(`${moduleHolder.Modules.emojie.error} Somthing went whrong.`)
            .setColor(moduleHolder.Modules.discord.Colors.Red)
            .setFooter({ text: `${moduleHolder.Modules.private.embedFooter}`, iconURL: `${bot.user.displayAvatarURL({ extension: 'png' })}` })
          message.followUp({ embeds: [errorEmbed] }).catch(err => console.err);
          break;
      }
    }).catch(e => { message.followUp({ content: `Somthing went whrong: ${e.message}` }).catch(err => console.err); });

  }
};
