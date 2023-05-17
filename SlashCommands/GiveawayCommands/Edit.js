const ModuleHolder = require("../../Classes/ModuleHolder");
const moduleHolder = new ModuleHolder();

module.exports = {
  help: {
    name: "edit",
    aliases: ["gvw-edit", 'gvwedit'],
    description: `Edit an active giveaway. (enter no to leave the setting like it was)`,
    examples: [`giveaway-edit`, `giveaway-edit <messageID> <role/no> <prize/no> <time/no> <winners/no>`],
    permissions: 'ManageMessages',
    permissionsMe: ['none'],
    ownerOnly: false,
    file: __filename,
    arguments: [
      { name: 'message_id_string', description: 'channel to send the giveaway embed', required: true },
      { name: 'log_channel', description: 'channel to send the giveaway logs', required: false },
      { name: 'time_string', description: 'time for the giveaway to end', required: false },
      { name: 'winners_number', description: 'winners for the giveaway', required: false },
      { name: 'prize_string', description: 'giveaway Prize', required: false },
      { name: 'role', description: 'required role to enter giveaway', required: false },
      { name: 'note_string', description: 'note (optimal)', required: false },
      { name: 'invites_number', description: 'required stay invites (optimal)', required: false },
      { name: 'messages_number', description: 'required guild messages send (optimal)', required: false },
      { name: 'level_number', description: 'required guild level send (optimal)', required: false },
    ]
  },
  async run(bot, message, args) {
    let messageID = await message.options.getString("message_id_string") || "00";
    let logChannel = await message.options.getChannel("log_channel") || null;
    let price = await message.options.getString("prize_string") || null;
    let time = await message.options.getString("time_string") || null;
    let winners = await message.options.getInteger("winners_number") || null;
    let note = await message.options.getString("note_string") || null;
    let reqInvites = await message.options.getInteger("invites_number") || null;
    let reqMessages = await message.options.getInteger("messages_number") || null;
    let reqLevel = await message.options.getInteger("level_number") || null;

    let fetchedGiveaway = await bot.giveawayServices.GetAsync(message.guild.id, messageID) || null;
    if (!fetchedGiveaway) return message.followUp(`There is no giveaway with message id: ${messageID}`)
    let giveawayMessage = await message.guild.channels.cache.get(fetchedGiveaway?.ChannelId ?? "000")?.messages.fetch(messageID).catch(e => { }) || null
    if (!giveawayMessage) return message.followUp(`Giveaway message not found.`)

    fetchedGiveaway.LogChannelId = logChannel ? logChannel : fetchedGiveaway.LogChannelId
    fetchedGiveaway.Prize = price ? price : fetchedGiveaway.Prize
    fetchedGiveaway.Winners = winners ? winners : fetchedGiveaway.Winners
    fetchedGiveaway.RequiredInvites = reqInvites ? reqInvites : fetchedGiveaway.RequiredInvites
    fetchedGiveaway.RequiredMessages = reqMessages ? reqMessages : fetchedGiveaway.RequiredMessages
    fetchedGiveaway.RequiredLevel = reqLevel ? reqLevel : fetchedGiveaway.RequiredLevel
    fetchedGiveaway.Note = note ? note : fetchedGiveaway.Note

    if (time) {
      let TimeReggex = /^(\d)+(y|d|h|m)$/g
      if (!time.toLowerCase().match(TimeReggex)) return message.followUp(`${moduleHolder.Modules.emojie.error} Pls mention a valid time. (1s/m/d/y)`).catch(err => console.err);
      let timetocheck = moduleHolder.Modules.ms(time) || null
      if (!timetocheck) return message.followUp(`Pls mention a wel formated time -> \`5m/1d/1w/1mo\`!`)
      if (timetocheck < 600000) return message.followUp(`Minumum time is 10min`)
      fetchedGiveaway.Time = Date.now() + timetocheck
    }


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
            .setDescription(`Succesfully Updated [giveaway](https://discord.com/channels/${message.guild.id}/${fetchedGiveaway.ChannelId}/${msg.id})`)
          message.followUp({ embeds: [embed] }).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err);

          if (fetchedGiveaway.LogChannelId && fetchedGiveaway.LogChannelId != "000") {
            let logChannel = message.guild.channels.cache.get(fetchedGiveaway?.LogChannelId ?? "000").catch(e => { }) || null;
            let embed = new moduleHolder.Modules.discord.EmbedBuilder()
              .setColor(moduleHolder.Modules.discord.Colors.Blue)
              .setAuthor({ name: `Giveaway has been Updated!`, iconURL: `${bot.user.displayAvatarURL({ extension: 'png' })}`, url: `https://discord.com/channels/${message.guild.id}/${fetchedGiveaway.ChannelId}/${msg.id}` })
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
