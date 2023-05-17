const ModuleHolder = require("../Classes/ModuleHolder");
const AntiSystemModel = require("../Models/AntiSystemModel");
const LevelModel = require("../Models/LevelModel");
const MemberLevelModel = require("../Models/MemberLevelModel");
const MemberMessageCountModel = require("../Models/MemberMessageCountModel");
const TicketMessageModel = require("../Models/TicketMessageModel");

const moduleHolder = new ModuleHolder();
module.exports = async (bot, message) => {
  if (!message || !message.member || !message.guild || !message.channel || message.channel.type === 1) return;
  const antiSystemSettings = await bot.antiSystemServices.GetAsync(message.guild?.id ?? null) || new AntiSystemModel(message.guild.id);


  const memberMessageCount = await bot.memberMessageCountServices.GetAsync(message.guild.id, message.member.id) || new MemberMessageCountModel(message.guild.id, message.member.id, 0)
  memberMessageCount.MessageCount++
  bot.memberMessageCountServices.SetAsync(memberMessageCount);

  const excludedMessageTypes = [
    moduleHolder.Modules.discord.MessageType.AutoModerationAction,
    moduleHolder.Modules.discord.MessageType.ThreadCreated,
    moduleHolder.Modules.discord.MessageType.ThreadStarterMessage,
    moduleHolder.Modules.discord.MessageType.UserJoin,
    moduleHolder.Modules.discord.MessageType.GuildBoost,
  ];

  //Check if the message has been send in an exclude channel and check if the user has an exclude role
  const isInExcludeRole = message.member.roles.cache.filter(role => antiSystemSettings.ExcludeRoleIds.includes(role.id)).some(x => x);
  const isInExcludeChannel = antiSystemSettings.ExcludeChannelIds?.includes(message?.channel?.id ?? "000");
  const isInExcludeCategory = antiSystemSettings.ExcludeCategoryIds?.includes(message?.channel?.parentId ?? "000") || false;


  if (!isInExcludeRole && !isInExcludeChannel && !isInExcludeCategory && !excludedMessageTypes.includes(message.type)) {

    //AntiLink
    if (antiSystemSettings && antiSystemSettings.AntiLink == true && message.content.toLowerCase().match(/((?:[A-z0-9](?:[A-z0-9-]{0,61}[A-z0-9])?\.)+[A-z0-9][A-z0-9-]{0,61}[A-z])|(((https?:\/\/[A-z0-9](?:[A-z0-9-]{0,61}[A-z0-9])?)+[A-z0-9][A-z0-9-]{0,61}[A-z]))/g) && !message.member.permissions.has(moduleHolder.Modules.discord.PermissionFlagsBits.ManageMessages)) {
      let reason = 'Link'
      let suspectedreason = `${message.content}`
      let warnmessage = `Your are not allowed to send an **${reason}** in here!`
      let removemessage = true
      let userID = message.author.id
      bot.warnServices.WarnUser(bot, reason, suspectedreason, warnmessage, message.member, message, removemessage);
    }

    //Anti Mal Link
    if (antiSystemSettings && antiSystemSettings.AntiMalLink === true && !message.member.permissions.has(moduleHolder.Modules.discord.PermissionFlagsBits.ManageMessages)) {
      let linkrgx = /^(discord\.gg\/)|(https?:\/\/)([a-zA-Z0-9]+(-?[a-zA-Z0-9])*\.)+[\w]{2,}(\/\S*)?|(www\.)([a-zA-Z0-9]+(-?[a-zA-Z0-9])*\.)+[\w]{2,}(\/\S*)?|(https?:\/\/)?(www\.)?([a-zA-Z0-9]+(-?[a-zA-Z0-9])*\.)+[\w]{2,}(\/\S*)?/g
      let messageUrl = message.content.toLowerCase().match(linkrgx) || []
      if (messageUrl && messageUrl.length !== 0) {
        moduleHolder.Modules.nodefetch('https://anti-fish.bitflow.dev/check', {
          method: 'post',
          body: JSON.stringify({ "message": `${message.content}` }),
          headers: {
            "User-Agent": `Saturn121`,
            "Content-Type": "application/json"
          }
        }).then(async response => {
          let resp = await response.json() || null
          if (resp && resp.match === true) {
            let reason = 'MaliciousLink'
            let suspectedreason = `${moduleHolder.Modules.emojie.error} **Do not open these ${resp.matches && resp.matches.length > 0 && resp.matches[0].type ? `(\`${resp.matches[0].type}\`)` : ''} urls!**\n\n${message.content}`
            let warnmessage = `Your are not allowed to send an **${reason}** ${resp.matches && resp.matches.length > 0 && resp.matches[0].type ? `(\`${resp.matches[0].type}\`)` : ''} in here!`
            let removemessage = true
            let userID = message.author.id
            bot.warnServices.WarnUser(bot, reason, suspectedreason, warnmessage, message.member, message, removemessage);
          }
        }).catch(e => { })
      }
    }

    // AntiIp
    if (antiSystemSettings && antiSystemSettings.AntiIp === true && !message.member.permissions.has(moduleHolder.Modules.discord.PermissionFlagsBits.ManageMessages)) {
      if (message.content.toLowerCase().match(/(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\W+(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\W+(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\W+(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)/g)) {
        let reason = 'Ip'
        let suspectedreason = `${message.content}`
        let warnmessage = `Your are not allowed to send an **${reason}** in here!`
        let removemessage = true
        let userID = message.author.id
        bot.warnServices.WarnUser(bot, reason, suspectedreason, warnmessage, message.member, message, removemessage);
      }
    }

    //AntiSelfBot
    if (antiSystemSettings && antiSystemSettings.AntiSelfbot === true && !message.member.permissions.has(moduleHolder.Modules.discord.PermissionFlagsBits.ManageMessages)) {
      if (message.embeds.length !== 0 && message.author.bot === false) {
        message.embeds.map(async e => {
          if (e.data.type.toLowerCase() !== 'image' && e.data.type.toLowerCase() !== 'video' && e.data.type.toLowerCase() !== 'gifv' && e.data.type.toLowerCase() !== 'article' && e.data.type.toLowerCase() !== 'link') {
            let reason = `Selfbot`
            let suspectedreason = `Embed message`
            let warnmessage = `Your are not allowed to use a **${reason}** in here!`
            let removemessage = true
            let userID = message.author.id
            bot.warnServices.WarnUser(bot, reason, suspectedreason, warnmessage, message.member, message, removemessage);
          }
        })
      }
    }

    //Anti Non Ascii
    // Anti non ASCII generate String start
    String.prototype.ToBasicLatin = function () {
      // ! to Z
      const minAllowedRange = 32,
        maxAllowedRange = 122;
      return this.toString().split('').filter(char => {
        let charCodePoint = char.codePointAt(0);
        // if (charCodePoint === 32) return;
        return charCodePoint >= minAllowedRange && charCodePoint <= maxAllowedRange;
      }).join('');
    }
    String.Random = function (length, chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQTRSUVWXYZ0123456789') {
      var result = '';
      for (var i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * 62));
      }
      return result;
    }
    //Anti non ASCII generate String end
    if (antiSystemSettings && antiSystemSettings.AntiNonAscii === true && message.author.bot === false && message.guild.members.me.permissions.has(moduleHolder.Modules.discord.PermissionFlagsBits.ManageNicknames)) {
      let guildUser = message.member,
        userUsername = guildUser.displayName,
        usernameLength = userUsername.length,
        filteredUsername = userUsername.ToBasicLatin(),
        filteredUsernameLength = filteredUsername.length,
        username = message.member.nickname || message.author.username,
        fullchangename = `user_${String.Random(5)}`,
        fullchangenameDB = null; // set custom name here !!!!!!!!!!!!!!!!
      if (fullchangenameDB !== null) {
        fullchangename = `${fullchangenameDB}${String.Random(5)}`
      }
      const reggex = /[a-zA-Z]+/g
      if (!filteredUsername.match(reggex)) {
        filteredUsernameLength = 0
      }
      const WarnEmbed1 = new moduleHolder.Modules.discord.EmbedBuilder()
        .setThumbnail(message.author.displayAvatarURL({ dynamic: true, extension: 'png' }))
        .setDescription(`Hey you, we changed your username since you had no valid characters so remember to change your username with valid characters !\n\nOld Username: **${username}** - New Username: **${fullchangename}**`)
      const WarnEmbed2 = new moduleHolder.Modules.discord.EmbedBuilder()
        .setThumbnail(message.author.displayAvatarURL({ dynamic: true, extension: 'png' }))
        .setDescription(`Hey we changed your username because it contains invalid characters.\n\nOld Username: **${username}** - New Username: **${filteredUsername}**`)
      if (filteredUsernameLength <= 0) {
        guildUser.setNickname(`${fullchangename}`).then(() => {
          return message.reply({ embeds: [WarnEmbed1] }).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err);
        }).catch(err => { });
      } else {
        if (usernameLength !== filteredUsernameLength) {
          guildUser.setNickname(filteredUsername).then(() => {
            return message.reply({ embeds: [WarnEmbed2] }).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err);
          }).catch(err => { });
        }
      }
    }


    //AntiSpam
    if (antiSystemSettings && antiSystemSettings.AntiSpam === true && !message.member.permissions.has(moduleHolder.Modules.discord.PermissionFlagsBits.ManageMessages)) {
      let antiCollection = bot.AntiSpamCollection.get(`${message.guild.id}_${message.member.id}`) || null;

      // add message to the collection array
      if (antiCollection) {
        antiCollection.push(message);
        if (antiCollection.length > 5) antiCollection.shift();
        bot.AntiSpamCollection.set(`${message.guild.id}_${message.member.id}`, antiCollection)
      } else {
        bot.AntiSpamCollection.set(`${message.guild.id}_${message.member.id}`, [message])
      }
      //get last message from the collection
      let firstMsg = antiCollection ? antiCollection[0] : null;
      //if there are 5+ messages and the first message has been send within 5 sec of the last message then trigger the below code
      if (firstMsg && antiCollection.length >= 5 && ((Date.now() - 5000) - firstMsg.createdTimestamp) < 5000) {
        let reason = `Spam`
        let suspectedreason = `Spamming messages`
        let warnmessage = `Your are not allowed to **${reason}** in here!`
        let removemessage = false
        let userID = message.author.id
        bot.warnServices.WarnUser(bot, reason, suspectedreason, warnmessage, message.member, message, removemessage);
        antiCollection.map(msg => msg.delete().catch(e => console.e))
        bot.AntiSpamCollection.delete(`${message.guild.id}_${message.member.id}`)
      }
    }




  }




  //GuessTheNumber
  const guessTheNumberSettings = await bot.guessTheNumberServices.GetAsync(message.guild.id);
  if (guessTheNumberSettings && guessTheNumberSettings.Enabled == true && guessTheNumberSettings.ChannelId == message.channel.id && message.member.user.bot == false) {
    //check if the user has one of the ignored roles
    const hasExcludeRole = message.member.roles.cache.filter(role => guessTheNumberSettings.IgnoreRoleIds.includes(role.id)).some(x => x);
    if (hasExcludeRole) {
      let CantPlayE = new moduleHolder.Modules.discord.EmbedBuilder()
        .setDescription(`You can not play this game because you have the role(s) ${message.member.roles.cache.filter(role => guessTheNumberSettings.IgnoreRoleIds.includes(role.id)).map(r => r)}!`)
        .setColor(moduleHolder.Modules.discord.Colors.Blue)
      return message.reply({ embeds: [CantPlayE] }).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 10000)).catch(err => console.err);
    }

    //check if message is a number
    let notAnr = new moduleHolder.Modules.discord.EmbedBuilder()
      .setDescription(`**${message.content}** isnt a number!`)
      .setFooter({ text: `Guess the number between ${guessTheNumberSettings.MinimumNumber} and ${guessTheNumberSettings.MaximumNumber}!`, iconURL: `${bot.user.displayAvatarURL({ extension: 'png' })}` })
      .setColor(moduleHolder.Modules.discord.Colors.Blue)
    if (isNaN(message.content)) return message.reply({ embeds: [notAnr] }).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 10000)).catch(err => console.err);

    //convert message to number
    const messageNumber = Number(message.content);

    //check if number was out of range with the max an minimum numbers
    if (Number(messageNumber) > Number(guessTheNumberSettings.MaximumNumber) || Number(messageNumber) < Number(guessTheNumberSettings.MinimumNumber)) {
      let WhrongNRembed = new moduleHolder.Modules.discord.EmbedBuilder()
        .setColor(moduleHolder.Modules.discord.Colors.Blue)
        .setDescription(`Pls guess a number between **${guessTheNumberSettings.MinimumNumber}** and **${guessTheNumberSettings.MaximumNumber}**!`)
      return message.reply({ embeds: [WhrongNRembed] }).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 10000)).catch(err => console.err);
    }

    //check if number was close to the winning number (close as in 5 numbers from the winning number)
    if (((Number(guessTheNumberSettings.WinningNumber) - 5) <= messageNumber) && ((Number(guessTheNumberSettings.WinningNumber) + 5) >= messageNumber) && Number(messageNumber) != Number(guessTheNumberSettings.WinningNumber)) {
      setTimeout(async () => {
        let CloseToembed = new moduleHolder.Modules.discord.EmbedBuilder()
          .setColor(moduleHolder.Modules.discord.Colors.Blue)
          .setDescription(`**Somone was verry close to the correct number!**`)
          .setFooter({ text: `Guess the number between ${guessTheNumberSettings.MinimumNumber} and ${guessTheNumberSettings.MaximumNumber}!`, iconURL: `${bot.user.displayAvatarURL({ extension: 'png' })}` })
        return message.channel.send({ embeds: [CloseToembed] }).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3000)).catch(err => console.err);
      }, 2000)
    }

    // check if the given number is the winning number
    if (Number(messageNumber) === Number(guessTheNumberSettings.WinningNumber)) {
      //lock the channel for everyone
      let everyone = await message.guild.roles.cache.find(r => r.name == '@everyone') || null;
      if (everyone) {
        await message.channel.permissionOverwrites.create(everyone, {
          SendMessages: false,
          ViewChannel: true,
          ReadMessageHistory: true,
          AddReactions: true
        }).catch(e => { });
      }
      message.react('839999001104744478').catch(err => console.err);
      let CorrectNR = new moduleHolder.Modules.discord.EmbedBuilder()
        .setColor(moduleHolder.Modules.discord.Colors.Blue)
        .setDescription(`You guessed the correct number: **${messageNumber}**!\nPrize: **${guessTheNumberSettings.Prize}**`)
        .setFooter({ text: `${message.member.user.tag}`, iconURL: message.member.user.displayAvatarURL({ dynamic: true }) })
      message.reply({ embeds: [CorrectNR] }).catch(err => console.err);

      //remove the guess the nr game from the db
      await bot.guessTheNumberServices.RemoveAsync(guessTheNumberSettings);
    }
  }


  // Leveling system
  const levelSystemSettings = await bot.levelServices.GetAsync(message.guild.id) || new LevelModel(message.guild.id);
  if (levelSystemSettings && levelSystemSettings.Enabled == true && message.member.user.bot == false && !excludedMessageTypes.includes(message.type)) {
    const memberLevel = await bot.levelServices.GetMemberLevelAsync(message.guild.id, message.member.id) || new MemberLevelModel(message.guild.id, message.member.id);
    const levelChanl = message.guild.channels.cache.get(levelSystemSettings?.LogChannelId ?? "000") || null
    const generatedXp = Math.floor(Math.random() * levelSystemSettings.XpPerMessage);
    memberLevel.Xp += generatedXp;
    memberLevel.TotalXp += generatedXp;
    if (memberLevel.Xp >= memberLevel.Level * 40) {
      memberLevel.Level++;
      memberLevel.Xp = 0;
      levelChanl?.send(`${message.author} You just advanced to level **${memberLevel.Level}** !`).catch(err => console.err)
    }
    await bot.levelServices.SetMemberLevelAsync(memberLevel);
  }



  // save ticket messages (for transcriptions)
  let channelIsInATicketChannel = await bot.ticketServices.GetOpenTicketByChannelAsync(message.guild.id, message.channel.id) || null;
  if (channelIsInATicketChannel && channelIsInATicketChannel.TicketMessages) {
    await channelIsInATicketChannel.TicketMessages.push(JSON.stringify(new TicketMessageModel(message)))
    bot.ticketServices.SetOpenTicketAsync(channelIsInATicketChannel);
  }











}





