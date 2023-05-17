const GuessTheNumberModel = require("../../Models/GuessTheNumberModel");
const ModuleHolder = require("../../Classes/ModuleHolder")

const moduleHolder = new ModuleHolder();
module.exports = {
  help: {
    name: "edit",
    aliases: ["edit-guess-the-nr", "edguess"],
    description: 'Edit the current running guess the number game.',
    examples: [`edit...`],
    permissions: 'ManageMessages',
    permissionsMe: ['none'],
    ownerOnly: false,
    file: __filename,
    arguments: [
      { name: 'minimum_number', description: 'The minimum number to guess', required: true },
      { name: 'maximum_number', description: 'The maximum number to guess', required: true },
      { name: 'winning_number', description: 'The winning number', required: true },
      { name: 'prize_string', description: 'Prize to Win', required: false },
      { name: 'channel', description: 'Channel to start the game', required: false },
    ]
  },
  async run(bot, message, args) {

    const currentSettings = await bot.guessTheNumberServices.GetAsync(message.guild.id) || null;

    if (!currentSettings) {
      let embed = new moduleHolder.Modules.discord.EmbedBuilder()
        .setDescription(`${moduleHolder.Modules.emojie.error} There is no guess the nr running in this server.`)
        .setColor(moduleHolder.Modules.discord.Colors.Red)
        .setFooter({ text: `${moduleHolder.Modules.private.embedFooter}`, iconURL: `${bot.user.displayAvatarURL({ extension: 'png' })}` })
      return message.followUp({ embeds: [embed] }).catch(err => console.err);
    }


    let minimumNR = await message.options.getInteger("minimum_number") || null;
    let maximumNR = await message.options.getInteger("maximum_number") || null;
    let winningNR = await message.options.getInteger("winning_number") || null;
    let chantosend = await message.options.getChannel("channel") || null
    let price = await message.options.getString("prize_string") || null;

    if (minimumNR) currentSettings.MinimumNumber = minimumNR;
    if (maximumNR) currentSettings.MaximumNumber = maximumNR;
    if (winningNR) currentSettings.WinningNumber = winningNR;
    if (chantosend) currentSettings.ChannelId = chantosend.id;
    if (price) currentSettings.Prize = price;


    if (chantosend !== null) {
      chantosend.setTopic(`Prize: ${price} - Guess the number between ${minimumNR} and ${maximumNR}!`)
      let everyone = message.guild.roles.cache.find(r => r.name === '@everyone');
      chantosend.permissionOverwrites.create(everyone, {
        SendMessages: true,
        ViewChannel: true,
        ReadMessageHistory: true,
        AddReactions: false
      });
      chantosend.setRateLimitPerUser(60)
    } else {
      curChannel = bot.channels.cache.get(currentSettings.ChannelId) || null;
      if (curChannel != null) {
        curChannel.setTopic(`Prize: ${price} - Guess the number between ${minimumNR} and ${maximumNR}!`)
      }
    }


    const saved = await bot.guessTheNumberServices.SetAsync(currentSettings);
    switch (saved?.acknowledged ?? false) {
      case true:
        if (chantosend) {
          let startGameEmb = new moduleHolder.Modules.discord.EmbedBuilder()
            .setColor(moduleHolder.Modules.discord.Colors.Blue)
            .setDescription(`**Guess the number game has been started!**\nGuess the number between \`${minimumNR}\` and \`${maximumNR}\`!\nPrize: \`${price}\``)
            .setFooter({ text: `${moduleHolder.Modules.private.embedFooter}`, iconURL: `${bot.user.displayAvatarURL({ extension: 'png' })}` })
          chantosend.send({ embeds: [startGameEmb] }).catch(err => console.err)
        }
        let succesE = new moduleHolder.Modules.discord.EmbedBuilder()
          .setColor(moduleHolder.Modules.discord.Colors.Blue)
          .setDescription(`Succesfully edited current guess the number game`)
          .setFooter({ text: `${moduleHolder.Modules.private.embedFooter}`, iconURL: `${bot.user.displayAvatarURL({ extension: 'png' })}` })
        message.followUp({ embeds: [succesE] }).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err)
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
