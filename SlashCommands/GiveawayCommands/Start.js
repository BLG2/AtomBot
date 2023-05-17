const ModuleHolder = require("../../Classes/ModuleHolder");
const GiveawayModel = require("../../Models/GiveawayModel");
const moduleHolder = new ModuleHolder();

module.exports = {
  help: {
    name: "start",
    aliases: ["gvw"],
    description: `Start a giveaway.`,
    examples: [`giveaway`, `giveaway <channel> <requiredRole/no> <time> <winners> <prize> | <note (optimal)>`],
    permissions: 'ManageMessages',
    permissionsMe: ['none'],
    ownerOnly: false,
    file: __filename,
    arguments: [
      { name: 'channel', description: 'channel to send the giveaway embed', required: false },
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
    let chantosend = await message.options.getChannel("channel") || message.channel
    let logChannel = await message.options.getChannel("log_channel") || {id:"000"}
    let price = await message.options.getString("prize_string") || 'Somthing special'
    let time = await message.options.getString("time_string") || '3d'
    let winners = await message.options.getInteger("winners_number") || 1
    let note = await message.options.getString("note_string") || `Hosted by: ${message.member.user.tag}`
    let reqInvites = await message.options.getInteger("invites_number") || 0
    let reqMessages = await message.options.getInteger("messages_number") || 0
    let reqLevel = await message.options.getInteger("level_number") || 0

    let TimeReggex = /^(\d)+(y|d|h|m|s)$/g
    if (!time.toLowerCase().match(TimeReggex)) return message.followUp(`${moduleHolder.Modules.emojie.error} Pls mention a valid time. (1s/m/d/y)`).catch(err => console.err);
    let timetocheck = moduleHolder.Modules.ms(time) || null
    if (!timetocheck) return message.followUp(`Pls mention a wel formated time -> \`5m/1d/1w/1mo\`!`)
    if (timetocheck < 600000) return message.followUp(`Minumum time is 10min`)
    let gvwDate = Date.now() + timetocheck;
    let gvwFormatDate = moduleHolder.Modules.moment(gvwDate)
    let relative = `${gvwFormatDate}`
    if (gvwFormatDate) {
      relative = moduleHolder.Modules.discordBuilder.time(gvwFormatDate._d, 'R') || ''
    }

    let embed = new moduleHolder.Modules.discord.EmbedBuilder()
      .setTitle(`${moduleHolder.Modules.emojie.giveaway} GIVEAWAY ${moduleHolder.Modules.emojie.giveaway}`)
      .setColor(moduleHolder.Modules.discord.Colors.Blue)
      .setDescription(`
\`Prize:\`  ${price}
\`Winner(s):\`  ${winners}
\`Reaming Time:\`  ${relative}

\`Note:\`  ${note}`)
      .setFooter({ text: `Giveaway sys`, iconURL: `${bot.user.displayAvatarURL({ extension: 'png' })}` })
    let enter = new moduleHolder.Modules.discord.ButtonBuilder()
      .setCustomId(`giveaway_enter_${message.guild.id}`)
      .setLabel(`Enter`)
      .setStyle(3)
    let leave = new moduleHolder.Modules.discord.ButtonBuilder()
      .setCustomId(`giveaway_leave_${message.guild.id}`)
      .setLabel(`Leave`)
      .setStyle(4)
    let info = new moduleHolder.Modules.discord.ButtonBuilder()
      .setCustomId(`giveaway_info_${message.guild.id}`)
      .setLabel(`Info`)
      .setStyle(1)
    let ButtonsToAdd = new moduleHolder.Modules.discord.ActionRowBuilder()
      .addComponents(enter)
      .addComponents(leave)
      .addComponents(info)

    await chantosend.send({
      embeds: [embed],
      "components": [ButtonsToAdd]
    }).then(async (msg) => {

      let giveawayModel = new GiveawayModel(message.guild.id, chantosend.id, msg.id, logChannel.id, gvwDate, price, winners, reqInvites, reqMessages, reqLevel, note, false, [], []);
      let started = await bot.giveawayServices.SetAsync(giveawayModel) || null;
      switch (started?.acknowledged ?? false) {
        case true:
          let embed = new moduleHolder.Modules.discord.EmbedBuilder()
            .setColor(moduleHolder.Modules.discord.Colors.Blue)
            .setDescription(`Succesfully Started [giveaway](https://discord.com/channels/${message.guild.id}/${chantosend.id}/${msg.id})`)
          message.followUp({ embeds: [embed] }).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err);

          if (logChannel && logChannel != "000") {
            let embed = new moduleHolder.Modules.discord.EmbedBuilder()
              .setColor(moduleHolder.Modules.discord.Colors.Blue)
              .setAuthor({ name: `Giveaway has been started!`, iconURL: `${bot.user.displayAvatarURL({ extension: 'png' })}`, url: `https://discord.com/channels/${message.guild.id}/${chantosend.id}/${msg.id}` })
              .addFields([{ name: `Executor:`, value: `${message.member} | ${message.member.user.tag}` }])
            logChannel.send({ embeds: [embed] }).catch(err => { });
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
