const { GuildMember, Message } = require("discord.js");
const DiscordBot = require("../Classes/DiscordBot");
const ModuleHolder = require("../Classes/ModuleHolder");
const MongoDB = require("../Classes/MongoDB");
const AntiSystemModel = require("../Models/AntiSystemModel");
const WarnUserModel = require("../Models/WarnUserModel");
const moduleHolder = new ModuleHolder();

module.exports = class WarnService {
  MongoDb;

  /**
  * @param {MongoDB} mongoDb
  */
  constructor(mongoDb) {
    this.MongoDb = mongoDb;
  }

  /**
   * @param {DiscordBot} bot
   * @param {String} warnType
   * @param {String} suspectedData
   * @param {String} warnMessage
   * @param {GuildMember} member
   * @param {Message} message
   * @param {Boolean} removeMessage
   */
  async WarnUser(bot, warnType, suspectedData, warnMessage, member, message, removeMessage) {
    const antiSystemSettings = await bot.antiSystemServices.GetAsync(message.guild?.id ?? null) || new AntiSystemModel(message.guild.id);
    if (antiSystemSettings == null) return;
    if (removeMessage === true && message) message.delete().catch(err => console.err);

    let warnings = await this.GetAsync(message.guild.id, member.id, warnType) || { GuildId: message.guild.id, MemberId: member.id, WarnType: warnType, WarnCount: 0 };
    await this.SetWarningAsync(new WarnUserModel(message.guild.id, member.id, warnType, warnings.WarnCount + 1))

    if (warnType.toLowerCase() == "server") {
      const warnEmbed = new moduleHolder.Modules.discord.EmbedBuilder()
        .setTitle(`Server Warning`)
        .setAuthor({ name: `${member.user.tag}` })
        .setColor(moduleHolder.Modules.discord.Colors.Blue)
        .setDescription(`${warnMessage}`)
        .setFooter({ text: `Total ${warnType} warns: ${warnings.WarnCount + 1}` })
      message.channel.send({ content: `${member}`, embeds: [warnEmbed] }).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err);
    } else {
      const warnEmbed = new moduleHolder.Modules.discord.EmbedBuilder()
        .setTitle(`Anti ${warnType.toUpperCase()}`)
        .setAuthor({ name: `${member.user.tag}` })
        .setColor(moduleHolder.Modules.discord.Colors.Blue)
        .setDescription(`${moduleHolder.Modules.emojie.error} ${warnMessage}`)
        .setFooter({ text: `Total ${warnType} warns: ${warnings.WarnCount + 1}` })
      message.channel.send({ embeds: [warnEmbed] }).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err);
    }


    let memberName = member && member.user ? `${member} | ${member.user.tag} | ${member.id}` : Unknown
    let messageContent = message?.content ?? "Unknown"
    const logEmbed = new moduleHolder.Modules.discord.EmbedBuilder()
      .setTitle(`Anti ${warnType.toUpperCase()}`)
      .setAuthor({ name: `Somone has been warned.` })
      .setColor(moduleHolder.Modules.discord.Colors.Blue)
      .addFields([
        { name: "User", value: `${memberName ?? "Unknown"}` },
        { name: "Message Content", value: `${messageContent ?? "Unknown"}` }
      ])
      .setFooter({ text: `Total ${warnType} warns: ${warnings.WarnCount + 1}` })
    let logChannel = message.guild.channels.cache.get(antiSystemSettings.LogChannelId ?? "000") || null;
    try { if (logChannel) logChannel?.send({ embeds: [logEmbed] }).catch(err => { }); } catch (e) { }

    if ((warnings.WarnCount + 1) >= antiSystemSettings.MaxWarnings) {
      this.Punish(antiSystemSettings.Punishement, message, member, warnType, warnings.WarnCount + 1);
    }
  }

  /**
   * @param {String} punishment
   * @param {Message} message
   * @param {GuildMember} member
   * @param {String} warnType
   * @param {Number} maxWarns
   */
  async Punish(punishment, message, member, warnType, maxWarns) {
    switch (punishment.toLowerCase()) {
      case 'timeout':
        if (member !== null) {
          if (!member.permissions.has(moduleHolder.Modules.discord.PermissionFlagsBits.ModerateMembers)) {
            await member.timeout(86400000, `Reached maximum amount of ${warnType} warnsings`).then(async succes => {
              message.channel.send(`Timed Out **${member.user.tag}** for reaching the maximum amount (${maxWarns}) of Anti **${reason}**`).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err);
              await this.RemoveAsync(message.guild.id, member.id, warnType);
            }).catch(e => { console.log(e) })
          }
        }
        break;
      case 'softban':
        if (member !== null) {
          if (!member.permissions.has(moduleHolder.Modules.discord.PermissionFlagsBits.BanMembers)) {
            message.guild.members.ban(member, {
              days: 7,
              reason: `Reached maximum amount of ${warnType} warnsings`,
            }).then(b => {
              if (b) { message.guild.members.unban(b).catch(err => message.channel.send(`${err}`)) }
            }).catch(err => console.err);
            await message.channel.send(`SoftBanned **${member.user.tag}** for reaching the maximum amount (${maxWarns}) of Anti **${warnType}**`).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err);
            await this.RemoveAsync(message.guild.id, member.id, warnType);
          }
        }
        break;
      case 'ban':
        if (member !== null) {
          if (!member.permissions.has(moduleHolder.Modules.discord.PermissionFlagsBits.BanMembers)) {
            message.guild.members.ban(member, {
              reason: `Reached maximum amount of ${warnType} warnsings`,
            }).catch(err => console.err);
            await message.channel.send(`Banned **${member.user.tag}** for reaching the maximum amount (${maxWarns}) of Anti **${warnType}**`).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err);
            await this.RemoveAsync(message.guild.id, member.id, warnType);
          }
        }
        break;
      case 'kick':
        if (member !== null) {
          if (!member.permissions.has(moduleHolder.Modules.discord.PermissionFlagsBits.KickMembers)) {
            await member.kick(`Reached maximum amount of ${rewarnTypeason} warnsings`).catch(err => console.err);
            await message.channel.send(`Kicked **${member.user.tag}** for reaching the maximum amount (${maxWarns}) of Anti **${warnType}**`).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err);
            await this.RemoveAsync(message.guild.id, member.id, warnType);
          }
        }
        break;
      case 'mute':
        if (!member.permissions.has(moduleHolder.Modules.discord.PermissionFlagsBits.MuteMembers)) {
          let muterole = await message.guild.roles.cache.find(r => r.name.toLowerCase() === 'muted') || null;
          if (muterole === null) {
            muterole = await message.guild.roles.cache.find(r => r.name.toLowerCase() === 'mute') || null;
            if (muterole === null) {
              try {
                muterole = await message.guild.roles.create({
                  data: {
                    name: "Muted",
                    color: "#000000",
                    permissions: []
                  }, reason: 'New mute role!'
                });
                await message.guild.channels.cache.forEach(async (channel, id) => {
                  await channel.permissionOverwrites.create(muterole, {
                    SendMessages: false,
                    ViewChannel: true,
                    AddReactions: false,
                    ReadMessageHistory: false,
                  });
                });
              } catch (e) {
                console.log(e.stack);
              }
            }
          }
          if (!member.roles.cache.has(muterole.id)) {
            await member.roles.add(muterole.id).catch(err => console.log(err));
            await message.channel.send(`Muted **${member.user.tag}** for reaching the maximum amount (${maxWarns}) of Anti **${warnType}**\nAuto unmute in **${moduleHolder.Modules.ms(mutetime)}**`).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err);
            await this.RemoveAsync(message.guild.id, member.id, warnType);
          }
        }
        break;
    }
  }

  /**
   * @param {WarnUserModel} warnUserModel
   */
  async SetWarningAsync(warnUserModel) {
    if (warnUserModel.GuildId && warnUserModel.MemberId && warnUserModel.WarnType) {
      let fetchedData = await this.GetAsync(warnUserModel.GuildId, warnUserModel.MemberId, warnUserModel.WarnType) || null;
      if (fetchedData) {
        return await this.MongoDb.UpdateOneAsync("AtomBot", "Warnings", fetchedData, warnUserModel)
      } else {
        return await this.MongoDb.AddOneAsync("AtomBot", "Warnings", warnUserModel)
      }
    }
    return null
  }

  /**
   * @param {String} guildId
   * @param {string} memberId
   * @param {string} warnType
   */
  async GetAsync(guildId, memberId, warnType) {
    if (guildId && memberId) {
      if (warnType) {
        return await this.MongoDb.GetOneAsync("AtomBot", "Warnings", { GuildId: guildId, MemberId: memberId, WarnType: warnType, })
      }
      return await this.MongoDb.GetOneAsync("AtomBot", "Warnings", { GuildId: guildId, MemberId: memberId })
    }
    return null
  }

  /**
   * @param {String} guildId
   * @param {string} memberId
   * @param {string} warnType
   */
  async RemoveAsync(guildId, memberId, warnType) {
    if (guildId && memberId) {
      let fetchedData = await this.GetAsync(guildId, memberId, warnType) || null;
      if (fetchedData) {
        return await this.MongoDb.RemoveOneAsync("AtomBot", "Warnings", fetchedData)
      }
    };
    return null
  }

  /**
   * @param {String} guildId
   * @param {string} memberId
   */
  async GetAllFromUserAsync(guildId, memberId) {
    if (guildId && memberId) {
      let fetchedData = await this.MongoDb.GetAllAsync("AtomBot", "Warnings") || null;
      if (fetchedData && fetchedData.length > 0) {
        return await fetchedData.filter(item => item.GuildId == guildId && item.MemberId == memberId);
      }
    };
    return []
  }




}
