const ModuleHolder = require("../Classes/ModuleHolder");
const AntiSystemModel = require("../Models/AntiSystemModel");

const moduleHolder = new ModuleHolder();
module.exports = async (bot, oldMessage, newMessage) => {
  if (!newMessage || !newMessage.member || !newMessage.guild || !newMessage.channel || newMessage.channel.type === 1) return;
  const antiSystemSettings = await bot.antiSystemServices.GetAsync(newMessage.guild?.id ?? null) || new AntiSystemModel(newMessage.guild.id);

  const excludedMessageTypes = [
    moduleHolder.Modules.discord.MessageType.AutoModerationAction,
    moduleHolder.Modules.discord.MessageType.ThreadCreated,
    moduleHolder.Modules.discord.MessageType.ThreadStarterMessage,
    moduleHolder.Modules.discord.MessageType.UserJoin,
    moduleHolder.Modules.discord.MessageType.GuildBoost,
  ];

  //Check if the message has been send in an exclude channel and check if the user has an exclude role
  const isInExcludeRole = newMessage.member.roles.cache.filter(role => antiSystemSettings.ExcludeRoleIds.includes(role.id)).some(x => x);
  const isInExcludeChannel = antiSystemSettings.ExcludeChannelIds?.includes(newMessage?.channel?.id ?? "000");
  const isInExcludeCategory = antiSystemSettings.ExcludeCategoryIds?.includes(newMessage?.channel?.parentId ?? "000") || false;
  if (!isInExcludeRole && !isInExcludeChannel && !isInExcludeCategory && !excludedMessageTypes.includes(newMessage.type)) {

    //AntiLink
    if (antiSystemSettings && antiSystemSettings.AntiLink == true && newMessage.content.toLowerCase().match(/((?:[A-z0-9](?:[A-z0-9-]{0,61}[A-z0-9])?\.)+[A-z0-9][A-z0-9-]{0,61}[A-z])|(((https?:\/\/[A-z0-9](?:[A-z0-9-]{0,61}[A-z0-9])?)+[A-z0-9][A-z0-9-]{0,61}[A-z]))/g) && !newMessage.member.permissions.has(moduleHolder.Modules.discord.PermissionFlagsBits.ManageMessages)) {
      let reason = 'Link'
      let suspectedreason = `${newMessage.content}`
      let warnmessage = `Your are not allowed to send an **${reason}** in here!`
      let removemessage = true
      let userID = newMessage.author.id
      bot.warnServices.WarnUser(bot, reason, suspectedreason, warnmessage, newMessage.member, newMessage, removemessage);
    }

    //Anti Mal Link
    if (antiSystemSettings && antiSystemSettings.AntiMalLink === true && !newMessage.member.permissions.has(moduleHolder.Modules.discord.PermissionFlagsBits.ManageMessages)) {
      let linkrgx = /^(discord\.gg\/)|(https?:\/\/)([a-zA-Z0-9]+(-?[a-zA-Z0-9])*\.)+[\w]{2,}(\/\S*)?|(www\.)([a-zA-Z0-9]+(-?[a-zA-Z0-9])*\.)+[\w]{2,}(\/\S*)?|(https?:\/\/)?(www\.)?([a-zA-Z0-9]+(-?[a-zA-Z0-9])*\.)+[\w]{2,}(\/\S*)?/g
      let messageUrl = newMessage.content.toLowerCase().match(linkrgx) || []
      if (messageUrl && messageUrl.length !== 0) {
        moduleHolder.Modules.nodefetch('https://anti-fish.bitflow.dev/check', {
          method: 'post',
          body: JSON.stringify({ "message": `${newMessage.content}` }),
          headers: {
            "User-Agent": `Saturn121`,
            "Content-Type": "application/json"
          }
        }).then(async response => {
          let resp = await response.json() || null
          if (resp && resp.match === true) {
            let reason = 'MaliciousLink'
            let suspectedreason = `${moduleHolder.Modules.emojie.error} **Do not open these ${resp.matches && resp.matches.length > 0 && resp.matches[0].type ? `(\`${resp.matches[0].type}\`)` : ''} urls!**\n\n${newMessage.content}`
            let warnmessage = `Your are not allowed to send an **${reason}** ${resp.matches && resp.matches.length > 0 && resp.matches[0].type ? `(\`${resp.matches[0].type}\`)` : ''} in here!`
            let removemessage = true
            let userID = newMessage.author.id
            bot.warnServices.WarnUser(bot, reason, suspectedreason, warnmessage, newMessage.member, newMessage, removemessage);
          }
        }).catch(e => { })
      }
    }

    // AntiIp
    if (antiSystemSettings && antiSystemSettings.AntiIp === true && !newMessage.member.permissions.has(moduleHolder.Modules.discord.PermissionFlagsBits.ManageMessages)) {
      if (newMessage.content.toLowerCase().match(/(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\W+(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\W+(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\W+(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)/g)) {
        let reason = 'Ip'
        let suspectedreason = `${newMessage.content}`
        let warnmessage = `Your are not allowed to send an **${reason}** in here!`
        let removemessage = true
        let userID = newMessage.author.id
        bot.warnServices.WarnUser(bot, reason, suspectedreason, warnmessage, newMessage.member, newMessage, removemessage);
      }
    }

    //AntiSelfBot
    if (antiSystemSettings && antiSystemSettings.AntiSelfbot === true && !newMessage.member.permissions.has(moduleHolder.Modules.discord.PermissionFlagsBits.ManageMessages)) {
      if (newMessage.embeds.length !== 0 && newMessage.author.bot === false) {
        newMessage.embeds.map(async e => {
          if (e.data.type.toLowerCase() !== 'image' && e.data.type.toLowerCase() !== 'video' && e.data.type.toLowerCase() !== 'gifv' && e.data.type.toLowerCase() !== 'article' && e.data.type.toLowerCase() !== 'link') {
            let reason = `Selfbot`
            let suspectedreason = `Embed message`
            let warnmessage = `Your are not allowed to use a **${reason}** in here!`
            let removemessage = true
            let userID = newMessage.author.id
            bot.warnServices.WarnUser(bot, reason, suspectedreason, warnmessage, newMessage.member, newMessage, removemessage);
          }
        })
      }
    }


  }

















}
