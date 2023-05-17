const { ButtonInteraction } = require('discord.js');
const DiscordBot = require('../Classes/DiscordBot');
const ModuleHolder = require('../Classes/ModuleHolder');
const SelfRoleService = require('../Services/SelfRoleService');
const ValidatorHelperService = require('../Services/ValidatorHelperService');
const Xor = require('../Services/Xor');

const xor = new Xor();
const moduleHolder = new ModuleHolder();
const validatorHelper = new ValidatorHelperService();
module.exports = class DiscordBotApi {
  Express;
  DiscordBot;
  /**
* @param {Express} express
* @param {DiscordBot} discordBot
*/
  constructor(express, discordBot) {
    this.Express = express;
    this.DiscordBot = discordBot
  }

  PostCheckMutualServers() {
    this.Express.App.post('/CheckMutualServers', async (req, res) => {
      if (req.body && req.body.Data) {
        var decrypted = await xor.Decrypt(req.body.Data) || null;
        let jsonParsed = null;
        try {
          jsonParsed = JSON.parse(decrypted) || null;
        } catch (e) { }
        if (jsonParsed && jsonParsed.User && jsonParsed.User.id && jsonParsed.Guilds && jsonParsed.Guilds.length > 0) {
          let mutualGuilds = []
          await jsonParsed.Guilds.map(async g => {
            if (this.DiscordBot.Bot.guilds.cache.get(g.id)) mutualGuilds.push(g);
          })

          var encrypted = await xor.Encrypt(JSON.stringify(mutualGuilds))
          return res.json({ Data: encrypted });
        }
      }

      return res.json(null);
    });
  }


  PostGetGuildInfo() {
    this.Express.App.post('/GetGuildInfo', async (req, res) => {
      if (req.body && req.body.Data) {
        var decrypted = await xor.Decrypt(req.body.Data) || null;
        let jsonParsed = null;
        try {
          jsonParsed = JSON.parse(decrypted) || null;
        } catch (e) { }
        if (jsonParsed && jsonParsed.GuildId && jsonParsed.UserId) {
          let guild = this.DiscordBot.Bot.guilds.cache.get(jsonParsed.GuildId);
          if (!guild) return res.json(null);
          if (!guild.members.cache.get(jsonParsed.UserId)) return res.json(null);
          var encrypted = await xor.Encrypt(JSON.stringify({
            DiscordGuild: guild,
            Channels: guild.channels.cache.map(chan => ({ id: chan.id, name: chan.name, type: chan.type })),
            Roles: guild.roles.cache.map(rol => ({ id: rol.id, name: rol.name, hexColor: rol.hexColor })),
            Members: guild.members.cache.map(mem => ({ id: mem.id, name: mem.user.username, discriminator: mem.user.discriminator, avatar: mem.displayAvatarURL({ dynamic: true, size: 4096 }), permissions: mem.permissions, roles: mem.roles.cache.map(rol => ({ id: rol.id, name: rol.name, hexColor: rol.hexColor })) }))
          }))
          return res.json({ Data: encrypted });
        }
      }
      return res.json(null);
    });
  }

  PostValidateGuildUser() {
    this.Express.App.post('/ValidateGuildUser', async (req, res) => {
      let respData = { success: false, message: "Somthing went whrong." }
      if (req.body && req.body.Data) {
        var decrypted = await xor.Decrypt(req.body.Data) || null;
        let jsonParsed = null;
        try {
          jsonParsed = JSON.parse(decrypted) || null;
        } catch (e) { }
        if (jsonParsed && jsonParsed.GuildId && jsonParsed.UserId) {
          let respData = { success: true, message: "" };
          let guild = this.DiscordBot.Bot.guilds.cache.get(jsonParsed.GuildId) || null;
          if (!guild) respData = { success: false, message: "Guild not found." };
          let user = guild ? guild.members.cache.get(jsonParsed.UserId) || null : null;
          if (!user) respData = { success: false, message: "User not found in guild." };
          if (!user.permissions.has(moduleHolder.Modules.discord.PermissionFlagsBits.ManageGuild)) respData = { success: false, message: "User not authorized to manage guild." };
          var encrypted = await xor.Encrypt(JSON.stringify(respData))
          return res.json({ Data: encrypted });
        }
      }
      return res.json(null);
    });
  }

  async PostSendGuildMessage() {
    this.Express.App.post('/SendGuildMessage', async (req, res) => {
      if (req.body && req.body.Data) {
        var decrypted = await xor.Decrypt(req.body.Data) || null;
        let jsonParsed = null;
        try {
          jsonParsed = JSON.parse(decrypted) || null;
        } catch (e) { }
        if (jsonParsed && jsonParsed.GuildId && jsonParsed.Type) {
          let guild = this.DiscordBot.Bot.guilds.cache.get(jsonParsed.GuildId) || null;
          if (!guild) return res.json({ success: false, message: "Guild not found." });
          switch (jsonParsed.Type) {
            case "SelfRole":
              await this.DiscordBot.Bot.selfRoleServices.SendMessageAsync(guild);
              break;
            case "Verification":
              await this.DiscordBot.Bot.verificationServices.SendMessageAsync(guild);
              break;
            case "Ticket":
              await this.DiscordBot.Bot.ticketServices.SendMessageAsync(guild);
              break;
          }
        }
      }

      res.status(200);
      return res.json({ succes: true });
    });
  }


  async PostSendLoginMessage() {
    this.Express.App.post('/SendLoginMsg', async (req, res) => {
      if (req.body && req.body.Data) {
        var decrypted = await xor.Decrypt(req.body.Data) || null;
        let jsonParsed = null;
        try {
          jsonParsed = JSON.parse(decrypted) || null;
        } catch (e) { }
        if (jsonParsed && jsonParsed.id) {
          let channel = this.DiscordBot.Bot.channels.cache.get("962415845072597002") || null;
          let logEmb = new moduleHolder.Modules.discord.EmbedBuilder()
            .setAuthor({ name: `Successful user login!`, iconURL: `https://cdn.discordapp.com/avatars/${jsonParsed.id}/${jsonParsed.avatar}.png?size=4096` })
            .addFields([{ name: `User:`, value: `${jsonParsed.username}#${jsonParsed.discriminator} | ${jsonParsed.id}` }])
            .setColor(moduleHolder.Modules.discord.Colors.Blue)
          channel?.send({ embeds: [logEmb] }).catch(err => console.err);
        }
      }

      res.status(200);
      return res.json({ succes: true });
    });
  }
  GetAllCommands() {
    this.Express.App.get('/GetAllCommands', async (req, res) => {
      var cmds = await this.DiscordBot.Bot.SlashCommands.map((a, b) => ({
        CommandName: a.help.name,
        CommandDescription: a.help.description,
        Categorie: b.split('-')[0],
        Arguments: a.help.arguments
      }))
      var encrypted = await xor.Encrypt(JSON.stringify(cmds))
      return res.json({ Data: encrypted });
    });
  }

  GetBotStats() {
    this.Express.App.get('/GetBotStats', async (req, res) => {
      var json = {
        ServerCount: this.DiscordBot.Bot.guilds.cache.size,
        ChannelCount: this.DiscordBot.Bot.channels.cache.size,
        CommandCount: this.DiscordBot.Bot.SlashCommands.size,
        MemberCount: this.DiscordBot.Bot.users.cache.size,
        ShardCount: this.DiscordBot.Bot.shard.count,
        DiscordVersion: moduleHolder.Modules.discord.version,
        Uptime: this.DiscordBot.Bot.uptime,
        NodeVersion: process.version
      }
      var encrypted = await xor.Encrypt(JSON.stringify(json))
      return res.json({ Data: encrypted });
    });
  }

  async SetMemberRolesAsync() {
    this.Express.App.post('/SetMemberRoles', async (req, res) => {
      if (req.body && req.body.Data) {
        var decrypted = await xor.Decrypt(req.body.Data) || null;
        let jsonParsed = null;
        try {
          jsonParsed = JSON.parse(decrypted) || null;
        } catch (e) { }
        if (jsonParsed && jsonParsed.GuildId && jsonParsed.MemberId && jsonParsed.Roles && jsonParsed.Roles.length > 0) {
          let guild = this.DiscordBot.Bot.guilds.cache.get(jsonParsed.GuildId ?? "000") || null;
          let member = guild ? guild.members.cache.get(jsonParsed.MemberId ?? "000") || null : null

          if (member.permissions.has(moduleHolder.Modules.discord.PermissionFlagsBits.ManageRoles)) {
            member.roles.cache.map(r => {
              if (jsonParsed.Roles.find(role => role.id == r.id) == null) {
                member.roles.remove(r).catch(e => { })
              }
            })
            jsonParsed.Roles.map(roleToAssign => {
              let role = guild ? guild.roles.cache.get(roleToAssign.id ?? "000") || null : null
              if (role) {
                if (!member.roles.cache.has(role.id)) {
                  member.roles.add(role).catch(e => { })
                }
              }
            })
            var encrypted = await xor.Encrypt(JSON.stringify({ succes: true, message: "" }))
            return res.json({ Data: encrypted });
          } else {
            var encrypted = await xor.Encrypt(JSON.stringify({ succes: true, message: "You do not have the correct permissions." }))
            return res.json({ Data: encrypted });
          }
        }
      }
      res.status(200);
      var encrypted = await xor.Encrypt(JSON.stringify({ succes: true, message: "Somthing went whrong performing request." }))
      return res.json({ Data: encrypted });
    });
  }






  async StartGiveawayAsync() {
    this.Express.App.post('/StartGiveaway', async (req, res) => {
      let status = { succes: false, message: "Somthing went whrong in the message API." };
      if (req.body && req.body.Data) {
        var decrypted = await xor.Decrypt(req.body.Data) || null;
        let jsonParsed = null;
        try {
          jsonParsed = JSON.parse(decrypted) || null;
        } catch (e) { }
        if (jsonParsed && jsonParsed.GuildId && jsonParsed.Prize && jsonParsed.Time && jsonParsed.Winners && jsonParsed.ChannelId) {
          let guild = this.DiscordBot.Bot.guilds.cache.get(jsonParsed.GuildId ?? "000") || null;
          let chantosend = guild ? guild.channels.cache.get(jsonParsed.ChannelId ?? "000") || null : null;
          if (chantosend) {
            let timetocheck = jsonParsed.Time;
            //  if (timetocheck > (Date.now() + 600000)) {
            let gvwDate = timetocheck;
            let gvwFormatDate = moduleHolder.Modules.moment(gvwDate)
            let relative = `${gvwFormatDate}`
            if (gvwFormatDate) {
              relative = moduleHolder.Modules.discordBuilder.time(gvwFormatDate._d, 'R') || ''
            }
            let embed = new moduleHolder.Modules.discord.EmbedBuilder()
              .setTitle(`${moduleHolder.Modules.emojie.giveaway} GIVEAWAY ${moduleHolder.Modules.emojie.giveaway}`)
              .setColor(moduleHolder.Modules.discord.Colors.Blue)
              .setDescription(`
\`Prize:\`  ${jsonParsed.Prize}
\`Winner(s):\`  ${jsonParsed.Winners}
\`Reaming Time:\`  ${relative}${jsonParsed.Note ? `\n\n\`Note:\` ${jsonParsed.Note}` : ""}`)
              .setFooter({ text: `Giveaway sys`, iconURL: `${this.DiscordBot.Bot.user.displayAvatarURL({ extension: 'png' })}` })
            let enter = new moduleHolder.Modules.discord.ButtonBuilder()
              .setCustomId(`giveaway_enter_${jsonParsed.GuildId}`)
              .setLabel(`Enter`)
              .setStyle(3)
            let leave = new moduleHolder.Modules.discord.ButtonBuilder()
              .setCustomId(`giveaway_leave_${jsonParsed.GuildId}`)
              .setLabel(`Leave`)
              .setStyle(4)
            let info = new moduleHolder.Modules.discord.ButtonBuilder()
              .setCustomId(`giveaway_info_${jsonParsed.GuildId}`)
              .setLabel(`Info`)
              .setStyle(1)
            let ButtonsToAdd = new moduleHolder.Modules.discord.ActionRowBuilder()
              .addComponents(enter)
              .addComponents(leave)
              .addComponents(info)

            let giveawayMessage = await chantosend?.messages.fetch(jsonParsed?.MessageId ?? "000").catch(e => { }) || null
            if (giveawayMessage) {
              await giveawayMessage.edit({
                embeds: [embed]
              }).then(m => {
                status = { succes: true, message: `Succesfully send message`, messageId: m.id };
              }).catch(e => {
                status = { succes: false, message: e.message };
              })
            } else {
              // if (jsonParsed?.MessageId == null)
              await chantosend.send({
                embeds: [embed],
                "components": [ButtonsToAdd]
              }).then(m => {
                status = { succes: true, message: `Succesfully send message`, messageId: m.id };
              }).catch(e => {
                status = { succes: false, message: e.message };
              })
            }
            // } else {
            //   status = { succes: false, message: `Minumum time is 10min` };
            // }
          } else {
            status = { succes: false, message: `No channel found to send the giveaway message.` };
          }
        }
      }
      res.status(200);
      var encrypted = await xor.Encrypt(JSON.stringify(status))
      return res.json({ Data: encrypted });
    });
  }




  //Get tickets
  async SendTicketMessageAsync() {
    this.Express.App.post('/SendTicketMessage', async (req, res) => {
      let status = { succes: false, message: "Somthing went whrong in the message API." };
      if (req.body && req.body.Data) {
        var decrypted = await xor.Decrypt(req.body.Data) || null;
        let jsonParsed = null;
        try {
          jsonParsed = JSON.parse(decrypted) || null;
        } catch (e) { }
        if (jsonParsed && jsonParsed.GuildId && jsonParsed.MemberId && jsonParsed.DbTicketObjectId && jsonParsed.Message) {
          var ticket = await this.DiscordBot.Bot.ticketServices.GetOpenTicketByObjectIdAsync(jsonParsed.DbTicketObjectId) || null;
          if (ticket != null) {
            var ticketGuild = this.DiscordBot.Bot.guilds.cache.get(jsonParsed.GuildId) || null;
            var ticketchannel = ticketGuild ? ticketGuild.channels.cache.get(ticket.ChannelId) || null : null;
            var sender = ticketGuild ? ticketGuild.members.cache.get(jsonParsed.MemberId) || null : null;
            if (ticketchannel && sender) {
              let embed = new moduleHolder.Modules.discord.EmbedBuilder()
                .setColor(moduleHolder.Modules.discord.Colors.Blue)
                .setAuthor({ name: `Send by ${sender.user.tag}`, iconURL: sender.user.displayAvatarURL({ dynamic: true }) })
                .setDescription(`${jsonParsed.Message}`)
                .setFooter({ text: `Send from AtomBotPanel` })
              await ticketchannel.send({ embeds: [embed] }).then(m => {
                status = { succes: true };
              }).catch(err => {
                status = { succes: false, message: err };
              });
            } else {
              status = { succes: false, message: "Unable to fetch channel." };
            }
          } else {
            status = { succes: false, message: "Ticket not found in the db." };
          }
        }
      }
      res.status(200);
      var encrypted = await xor.Encrypt(JSON.stringify(status))
      return res.json({ Data: encrypted });
    })
  }

  //Close tickets
  async CloseTicketAsync() {
    this.Express.App.post('/CloseTicket', async (req, res) => {
      let status = { succes: false, message: "Somthing went whrong in the message API." };
      if (req.body && req.body.Data) {
        var decrypted = await xor.Decrypt(req.body.Data) || null;
        let jsonParsed = null;
        try {
          jsonParsed = JSON.parse(decrypted) || null;
        } catch (e) { }
        if (jsonParsed && jsonParsed.GuildId && jsonParsed.MemberId && jsonParsed.DbTicketObjectId) {
          const ticketSettings = await this.DiscordBot.Bot.ticketServices.GetAsync(jsonParsed.GuildId) || null;
          var ticket = await this.DiscordBot.Bot.ticketServices.GetOpenTicketByObjectIdAsync(jsonParsed.DbTicketObjectId) || null;
          if (ticket != null) {
            var ticketGuild = this.DiscordBot.Bot.guilds.cache.get(jsonParsed.GuildId) || null;
            var ticketchannel = ticketGuild ? ticketGuild.channels.cache.get(ticket.ChannelId) || null : null;
            var actionMember = ticketGuild ? ticketGuild.members.cache.get(jsonParsed.MemberId) || null : null;
            if (ticketchannel && actionMember) {
              if (ticketSettings && ticketSettings.Enabled == true) {

                // add ticket member and tag roles perms
                await ticketchannel.permissionOverwrites.create(ticket.TicketMemberId, {
                  ManageMessages: false,
                  SendMessages: false,
                  ViewChannel: true,
                  AddReactions: true,
                  ReadMessageHistory: true,
                  AttachFiles: false
                }).catch(err => console.err);
                for (const id of ticketSettings?.RolesToTagIds ?? []) {
                  await ticketchannel.permissionOverwrites.create(id, {
                    ManageMessages: false,
                    SendMessages: false,
                    ViewChannel: true,
                    AddReactions: true,
                    ReadMessageHistory: true,
                    AttachFiles: false
                  }).catch(err => console.err);
                }
                var embedParent = new moduleHolder.Modules.discord.EmbedBuilder()
                  .setTitle(`Ticket has been closed`)
                  .setDescription(`Re-Open ticket to be able to send messages again in here.\n\nAn Admin wil delete this ticket verry soon!`)
                  .setColor(moduleHolder.Modules.discord.Colors.Blue)
                  .setFooter({ text: `❌ = Delete | 🎫 = Transcript | ✅ = ReOpen` });
                let del = new moduleHolder.Modules.discord.ButtonBuilder()
                  .setCustomId(`delete_ticket_${ticketGuild.id}`)
                  .setLabel(`Delete`)
                  .setEmoji(`❌`)
                  .setStyle(4)
                let trans = new moduleHolder.Modules.discord.ButtonBuilder()
                  .setCustomId(`transcript_ticket_${ticketGuild.id}`)
                  .setLabel(`Transcript`)
                  .setEmoji(`🎫`)
                  .setStyle(1)
                let reopen = new moduleHolder.Modules.discord.ButtonBuilder()
                  .setCustomId(`reopen_ticket_${ticketGuild.id}`)
                  .setLabel(`ReOpen`)
                  .setEmoji(`✅`)
                  .setStyle(1)
                let ButtonsToAdd = new moduleHolder.Modules.discord.ActionRowBuilder()
                  .addComponents(del)
                  .addComponents(trans)
                  .addComponents(reopen)
                await ticketchannel.send({
                  content: null,
                  embeds: [embedParent],
                  "components": [ButtonsToAdd]
                }).then(async m => {
                  status = { succes: true };
                }).catch(e => {
                  status = { succes: false, message: e };
                })

                //send log
                let ticketLogChannel = await ticketGuild.channels.cache.get(ticketSettings?.LogChannelId ?? "000");
                let reopenEmbed = new moduleHolder.Modules.discord.EmbedBuilder()
                  .setAuthor({ name: `Ticket Closed`, iconURL: actionMember.user.displayAvatarURL({ dynamic: true }) })
                  .addFields([
                    { name: `Executor:`, value: `${actionMember.user.tag} | ${actionMember}` },
                    { name: `Channel:`, value: `${ticketchannel.name} | ${ticketchannel}` }
                  ])
                  .setColor(moduleHolder.Modules.discord.Colors.Blue)
                ticketLogChannel?.send({ embeds: [reopenEmbed] }).catch(err => console.err);

              } else {
                status = { succes: false, message: "Ticketsystem isnt enabled." };
              }
            } else {
              status = { succes: false, message: "Unable to fetch channel." };
            }
          } else {
            status = { succes: false, message: "Ticket nt found in the db." };
          }
        }
      }
      res.status(200);
      var encrypted = await xor.Encrypt(JSON.stringify(status))
      return res.json({ Data: encrypted });
    })
  }



  //ReOpen tickets
  async ReopenTicketAsync() {
    this.Express.App.post('/ReopenTicket', async (req, res) => {
      let status = { succes: false, message: "Somthing went whrong in the message API." };
      if (req.body && req.body.Data) {
        var decrypted = await xor.Decrypt(req.body.Data) || null;
        let jsonParsed = null;
        try {
          jsonParsed = JSON.parse(decrypted) || null;
        } catch (e) { }
        if (jsonParsed && jsonParsed.GuildId && jsonParsed.MemberId && jsonParsed.DbTicketObjectId) {
          const ticketSettings = await this.DiscordBot.Bot.ticketServices.GetAsync(jsonParsed.GuildId) || null;
          var ticket = await this.DiscordBot.Bot.ticketServices.GetOpenTicketByObjectIdAsync(jsonParsed.DbTicketObjectId) || null;
          if (ticket != null) {
            var ticketGuild = this.DiscordBot.Bot.guilds.cache.get(jsonParsed.GuildId) || null;
            var ticketchannel = ticketGuild ? ticketGuild.channels.cache.get(ticket.ChannelId) || null : null;
            var actionMember = ticketGuild ? ticketGuild.members.cache.get(jsonParsed.MemberId) || null : null;
            var ticketMember = ticketGuild ? ticketGuild.members.cache.get(ticket.TicketMemberId) || null : null;
            if (ticketMember) {
              if (ticketchannel && actionMember) {
                if (ticketSettings && ticketSettings.Enabled == true) {

                  // add ticket member and tag roles perms
                  await ticketchannel.permissionOverwrites.create(ticket.TicketMemberId, {
                    ManageMessages: false,
                    SendMessages: true,
                    ViewChannel: true,
                    AddReactions: true,
                    ReadMessageHistory: true,
                    AttachFiles: true
                  }).catch(err => console.err);
                  for (const id of ticketSettings?.RolesToTagIds ?? []) {
                    await ticketchannel.permissionOverwrites.create(id, {
                      ManageMessages: false,
                      SendMessages: true,
                      ViewChannel: true,
                      AddReactions: true,
                      ReadMessageHistory: true,
                      AttachFiles: true
                    }).catch(err => console.err);
                  }




                  var embedParent = new moduleHolder.Modules.discord.EmbedBuilder()
                    .setAuthor({ name: `Hi, ${ticketMember.user.tag}`, iconURL: ticketMember.user.displayAvatarURL({ dynamic: true }) })
                    .setTitle(`Ticket: ${(ticketSettings?.TotalOpenedTickets ?? 0)} ReOpened`)
                    .setDescription(`${validatorHelper.ReplaceStringTags(ticketSettings.TicketOpenedMessage, ticketGuild, ticketMember)}`)
                    .setColor(moduleHolder.Modules.discord.Colors.Blue)
                    .setFooter({ text: `❌ = Close` });
                  let btn = new moduleHolder.Modules.discord.ButtonBuilder()
                    .setCustomId(`close_ticket_${ticketGuild.id}`)
                    .setLabel(`Close Ticket`)
                    .setEmoji(`❌`)
                    .setStyle(4)
                  let ButtonsToAdd = new moduleHolder.Modules.discord.ActionRowBuilder()
                    .addComponents(btn)

                  await ticketchannel.send({
                    content: `${ticketMember} ${ticketSettings.RolesToTagIds.length > 0 ? `, ${ticketSettings.RolesToTagIds.map(r => ticketGuild.roles.cache.get(r ?? "000"))}` : ""}`,
                    embeds: [embedParent],
                    "components": [ButtonsToAdd]
                  }).then(async m => {
                    status = { succes: true };
                  }).catch(e => {
                    status = { succes: false, message: e };
                  })

                  //send log
                  let ticketLogChannel = await ticketGuild.channels.cache.get(ticketSettings?.LogChannelId ?? "000");
                  let reopenEmbed = new moduleHolder.Modules.discord.EmbedBuilder()
                    .setAuthor({ name: `Re-Opened`, iconURL: actionMember.user.displayAvatarURL({ dynamic: true }) })
                    .addFields([
                      { name: `Executor:`, value: `${actionMember.user.tag} | ${actionMember}` },
                      { name: `Channel:`, value: `${ticketchannel.name} | ${ticketchannel}` }
                    ])
                    .setColor(moduleHolder.Modules.discord.Colors.Blue)
                  ticketLogChannel?.send({ embeds: [reopenEmbed] }).catch(err => console.err);

                } else {
                  status = { succes: false, message: "Ticketsystem isnt enabled." };
                }
              } else {
                status = { succes: false, message: "Unable to fetch channel." };
              }
            } else {
              status = { succes: false, message: "Unable to fetch ticket member." };
            }
          } else {
            status = { succes: false, message: "Ticket nt found in the db." };
          }
        }
      }
      res.status(200);
      var encrypted = await xor.Encrypt(JSON.stringify(status))
      return res.json({ Data: encrypted });
    })
  }


  //Delete tickets
  async DeleteTicketAsync() {
    this.Express.App.post('/DeleteTicket', async (req, res) => {
      let status = { succes: false, message: "Somthing went whrong in the message API." };
      if (req.body && req.body.Data) {
        var decrypted = await xor.Decrypt(req.body.Data) || null;
        let jsonParsed = null;
        try {
          jsonParsed = JSON.parse(decrypted) || null;
        } catch (e) { }
        if (jsonParsed && jsonParsed.GuildId && jsonParsed.MemberId && jsonParsed.DbTicketObjectId) {
          const ticketSettings = await this.DiscordBot.Bot.ticketServices.GetAsync(jsonParsed.GuildId) || null;
          var ticket = await this.DiscordBot.Bot.ticketServices.GetOpenTicketByObjectIdAsync(jsonParsed.DbTicketObjectId) || null;
          if (ticket != null) {
            var ticketGuild = this.DiscordBot.Bot.guilds.cache.get(jsonParsed.GuildId) || null;
            var ticketchannel = ticketGuild ? ticketGuild.channels.cache.get(ticket.ChannelId) || null : null;
            var actionMember = ticketGuild ? ticketGuild.members.cache.get(jsonParsed.MemberId) || null : null;
            var ticketMember = ticketGuild ? ticketGuild.members.cache.get(ticket.TicketMemberId) || null : null;
            if (ticketMember) {
              if (ticketchannel && actionMember) {
                if (ticketSettings && ticketSettings.Enabled == true) {

                  const hasTicketRole = actionMember.roles.cache.filter(role => ticketSettings.RolesToTagIds.includes(role.id)).some(x => x);
                  if (hasTicketRole || actionMember.permissions.has(moduleHolder.Modules.discord.PermissionFlagsBits.ManageMessages)) {

                    //send log
                    let ticketLogChannel = await ticketGuild.channels.cache.get(ticketSettings?.LogChannelId ?? "000");
                    let involvedUsers = [];

                    await ticket.TicketMessages.forEach(async m => {
                      try {
                        let toJson = JSON.parse(m);
                        if (toJson && toJson.authorId && !involvedUsers.includes(toJson.authorId)) {
                          involvedUsers.push(toJson.authorId);
                        }
                      } catch (e) { }
                    })

                    await this.DiscordBot.Bot.ticketServices.RemoveOpenTicketByChannelAsync(ticket);

                    let reopenEmbed = new moduleHolder.Modules.discord.EmbedBuilder()
                      .setAuthor({ name: `Ticket Deleted`, iconURL: actionMember.user.displayAvatarURL({ dynamic: true }) })
                      .addFields([
                        { name: `Executor:`, value: `${actionMember.user.tag} | ${actionMember}` },
                        { name: `Ticket ID:`, value: `${ticket.TicketId ?? "Unknown"}` },
                        { name: `Ticket User:`, value: `<@${ticket.TicketMemberId}> | ${ticket.TicketMemberId}` },
                        { name: `Tagged Ids:`, value: `${ticketSettings.RolesToTagIds.length > 0 ? ticketSettings.RolesToTagIds.map(r => `<@&${r}>`) : 'None'}` },
                        { name: `Involved Users:`, value: `${involvedUsers.length > 0 ? involvedUsers.map(u => `<@${u}>`) : `Unknown`}` },
                        { name: `Ticket Opened:`, value: `${moduleHolder.Modules.discordBuilder.time((moduleHolder.Modules.moment(ticket.TicketOpened))._d, 'R')}` },
                      ])
                      .setColor(moduleHolder.Modules.discord.Colors.Blue)
                    await ticketLogChannel?.send({ embeds: [reopenEmbed] }).then(async m => {
                      await this.DiscordBot.Bot.ticketServices.SaveTranscription(m, ticket, true);
                      status = { succes: true };
                    }).catch(err => console.err);

                    ticketchannel.delete().catch(e => {
                      status = { succes: false, message: e };
                    });

                  } else {
                    status = { succes: false, message: "Invalid permissions." };
                  }
                } else {
                  status = { succes: false, message: "Ticketsystem isnt enabled." };
                }
              } else {
                status = { succes: false, message: "Unable to fetch channel." };
              }
            } else {
              status = { succes: false, message: "Unable to fetch ticket member." };
            }
          } else {
            status = { succes: false, message: "Ticket nt found in the db." };
          }
        }
      }
      res.status(200);
      var encrypted = await xor.Encrypt(JSON.stringify(status))
      return res.json({ Data: encrypted });
    })
  }

















}
