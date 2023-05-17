const ModuleHolder = require("../../Classes/ModuleHolder");
const GuessTheNumberModel = require("../../Models/GuessTheNumberModel");

const moduleHolder = new ModuleHolder();
module.exports = {
  help: {
    name: "start",
    aliases: ["guess-the-nr", "guess"],
    description: 'Guess the number game.',
    examples: [`guessthenr <minimumNR> <maximumNR> <winningNR> <channel (optimal)> <price (optimal)>`],
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

    let minimumNR = await message.options.getInteger("minimum_number") || '0'
    let maximumNR = await message.options.getInteger("maximum_number") || '5'
    let winningNR = await message.options.getInteger("winning_number") || '50'
    let chantosend = await message.options.getChannel("channel") || null
    let price = await message.options.getString("prize_string") || 'Alot of fun'

    if (Number(maximumNR) <= Number(minimumNR)) {
      return message.followUp(`Maximum nr: ${minimumNR} cant be higher than the minimum nr: ${minimumNR}`)
    }
    if (Number(winningNR) < Number(minimumNR)) {
      return message.followUp(`Winning number has to be bigger than ${minimumNR}`)
    }
    if (Number(winningNR) > Number(maximumNR)) {
      return message.followUp(`Winning number has to be smaller than **${maximumNR}**`)
    }

    let currentSettings = await bot.guessTheNumberServices.GetAsync(message.guild.id) || null;

    if (currentSettings && currentSettings.Enabled) {
      let embed = new moduleHolder.Modules.discord.EmbedBuilder()
        .setDescription(`${moduleHolder.Modules.emojie.error} There is already a guess the nr running in this server.`)
        .setColor(moduleHolder.Modules.discord.Colors.Red)
        .setFooter({ text: `${moduleHolder.Modules.private.embedFooter}`, iconURL: `${bot.user.displayAvatarURL({ extension: 'png' })}` })
      return message.followUp({ embeds: [embed] }).catch(err => console.err);
    } else {
      currentSettings = new GuessTheNumberModel(message.guild.id, chantosend?.id, false, Number(minimumNR), Number(maximumNR), Number(winningNR), price);
    }

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
      const fetchedChannel = message.guild.channels.cache.find(c => c.name.toLowerCase() === 'guess-the-number') || null;
      if (fetchedChannel) {
        fetchedChannel.delete().catch(e => console.e);
      }
      await message.guild.channels.create({ name: 'Guess-the-number', type: 0 }).then(async (createdChan) => {
        chantosend = createdChan;
        createdChan.setTopic(`Prize: ${price} - Guess the number between ${minimumNR} and ${maximumNR}!`)
        let everyone = message.guild.roles.cache.find(r => r.name == '@everyone');
        createdChan.permissionOverwrites.create(everyone, {
          SendMessages: true,
          ViewChannel: true,
          ReadMessageHistory: true,
          AddReactions: false
        });
        createdChan.setRateLimitPerUser(60)
      })
    }

    currentSettings.ChannelId = chantosend.id;
    currentSettings.Enabled = true;
    const saved = await bot.guessTheNumberServices.SetAsync(currentSettings);
    switch (saved?.acknowledged ?? false) {
      case true:
        let startGameEmb = new moduleHolder.Modules.discord.EmbedBuilder()
          .setColor(moduleHolder.Modules.discord.Colors.Blue)
          .setDescription(`**Guess the number game has been started!**\nGuess the number between \`${minimumNR}\` and \`${maximumNR}\`!\nPrize: \`${price}\``)
          .setFooter({ text: `${moduleHolder.Modules.private.embedFooter}`, iconURL: `${bot.user.displayAvatarURL({ extension: 'png' })}` })
        chantosend.send({ embeds: [startGameEmb] }).catch(err => console.err)
        let succesE = new moduleHolder.Modules.discord.EmbedBuilder()
          .setColor(moduleHolder.Modules.discord.Colors.Blue)
          .setDescription(`Succesfully started guess the number game -> ${chantosend}`)
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
