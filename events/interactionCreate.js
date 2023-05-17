const ModuleHolder = require("../Classes/ModuleHolder");
const MemberInvitesModel = require("../Models/MemberInvitesModel");
const MemberLevelModel = require("../Models/MemberLevelModel");
const MemberMessageCountModel = require("../Models/MemberMessageCountModel");
const OpenTicketModel = require("../Models/OpenTicketModel");
const TicketModel = require("../Models/TicketModel");
const VerificationModel = require("../Models/VerificationModel");
const ValidatorHelperService = require("../Services/ValidatorHelperService");
const validatorHelper = new ValidatorHelperService();

const moduleHolder = new ModuleHolder();
let rateLimiter = new moduleHolder.Modules.rateLimiter.RateLimiter(1, 2000);

module.exports = async (bot, interaction) => {
  if (interaction && interaction.type === 2) await interaction.deferReply(); else if (interaction) await interaction.deferUpdate();
  if (!interaction || !interaction.member || !interaction.guild) return;

  //ratelimit slashcomands
  if (interaction && interaction.user && interaction.user.bot === false) {
    let limited = await rateLimiter.take(interaction.user.id) || false;
    if (limited === true) return interaction.reply({ content: `Cooldown pls wait 2sec`, ephemeral: true }).catch(err => console.err);
  }

  //log used command
  let commandName = interaction?.options?.getSubcommand() ?? null;
  let embedToSend = new moduleHolder.Modules.discord.EmbedBuilder()
  embedToSend.setTitle("Interaction Triggered")
  embedToSend.setColor(moduleHolder.Modules.discord.Colors.Blue)
  embedToSend.addFields([
    { name: "Type:", value: `\`${interaction.type ?? "Unknown"}\`` },
    { name: "Component Type:", value: `\`${interaction.componentType ?? "Unknown"}\`` },
    { name: "Custom ID", value: `\`${interaction.customId ?? "Unknown"}\`` },
    { name: "CommandName", value: `\`${commandName ?? "Unknown"}\`` }
  ])
  if (interaction.guild && interaction.channel) {
    embedToSend.setURL(`https://discord.com/channels/${interaction.guild.id}/${interaction.channel.id}`)
  }
  if (interaction.options && interaction.options.data && interaction.options.data.length !== 0) {
    await interaction.options.data.map(async d => {
      if (d.options && d.options.length !== 0) {
        embedToSend.data.fields.push({ name: "Arguments:", value: `\`${`${d.options.map(o => `${o.name}: ${o.value}`).join('\n')}`}\`` })
      }
    })
  }
  if (interaction.member && interaction.member.user) {
    embedToSend.data.fields.push({ name: "By user:", value: `\`${interaction.member.user.tag}\` | \`${interaction.member.id}\`` })
    embedToSend.setThumbnail(interaction.member.user.displayAvatarURL({ dynamic: true, extension: 'png' }))
  }
  if (interaction.guild) {
    embedToSend.data.fields.push({ name: "In server:", value: `\`${interaction.guild.name}\` | \`${interaction.guildId}\`` })
  }
  if (interaction.channel) {
    embedToSend.data.fields.push({ name: "In channel:", value: `\`${interaction.channel.name}\` | \`${interaction.channelId}\`` })
  }
  embedToSend.setTimestamp();
  const logChannel = bot.channels.cache.get("681113670863814677") || null;
  if (logChannel) {
    logChannel.send({ embeds: [embedToSend] }).catch(err => console.error);
  }


  if (interaction && interaction.type === 2) {
    let contextMenu = interaction.isContextMenuCommand() || false
    if (contextMenu === false) {
      //SLASH COMMANDS
      let args = null
      let subCmd = interaction.options.getSubcommand()
      const commandFile = subCmd ? await bot.SlashCommands.get(`${interaction.commandName.toLowerCase()}-${subCmd.toLowerCase()}`) || null : null
      if (commandFile && interaction.member) {
        if (interaction.options && interaction.options.data && interaction.options.data.length !== 0) {
          await interaction.options.data.map(async d => {
            d.options && d.options.length !== 0 ? args = d.options.map(o => o) : []
          })
        }
        //check if cmd is owner only
        let OwnerOnly = commandFile.help.ownerOnly || false;
        if (OwnerOnly === true && interaction.member.user.id !== moduleHolder.Modules.private.ownerID) return;
        //check if user needs permissions
        let permissions = commandFile.help.permissions || 'none'
        var discordMemberPers = moduleHolder.Modules.discord.PermissionFlagsBits[permissions];
        if (!discordMemberPers && permissions.toLowerCase() !== 'none') console.log(`Unable to get member command permission: ${permissions}`);
        if (permissions.toLowerCase() !== 'none' && !interaction.member.permissions.has(discordMemberPers)) return interaction.followUp({ content: `You need permissions **${permissions}** to use this command!`, ephemeral: false }).catch(e => console.e)
        //check if i need permissions
        let missingperms = [];
        let permissionsMe = commandFile.help.permissionsMe || ['none']
        if (!interaction.member.guild.members.me.permissions.has(moduleHolder.Modules.discord.PermissionFlagsBits.ViewChannel)) {
          missingperms.push('ViewChannel')
        }
        if (!interaction.member.guild.members.me.permissions.has(moduleHolder.Modules.discord.PermissionFlagsBits.SendMessages)) {
          missingperms.push('SendMessages')
        }
        try {
          await permissionsMe.forEach(perm => {
            var discordBotPers = moduleHolder.Modules.discord.PermissionFlagsBits[perm];
            if (!discordBotPers && perm.toLowerCase() !== 'none') console.log(`Unable to get bot command permission: ${perm}`);
            if (perm.toLowerCase() !== 'none' && !interaction.member.guild.members.me.permissions.has(discordBotPers)) {
              missingperms.push(perm)
            }
          });
        } catch (e) { }
        if (missingperms.length !== 0) return interaction.followUp({ content: `${moduleHolder.Modules.emojie.error} i need permissions **${missingperms.join(', ')}** for this system/command to work properly!`, ephemeral: true }).catch(e => console.e)

        //run command
        await commandFile.run(bot, interaction).catch(e => {
          interaction.followUp(`Error => ${e}`)
        })

      }
    }
  }

  if (interaction && interaction.type === 3) {
    if (interaction.componentType === 3) {
      //################## HELP MENU ######################
      if (interaction.guild && interaction.customId === `HelpMenu_${interaction.guild.id}` || interaction.customId === `HelpMenu1_${interaction.guild.id}`) {
        let member = interaction.guild.members.cache.find(member => member.id === interaction.user.id) || null;
        if (interaction.values.length > 0 && interaction.values[0] === 'EmptySlot') {
          // return interaction.deferUpdate().catch(e => console.e)
        }
        if (interaction.values.length > 0 && interaction.values[0] === 'AllCmds') {

          moduleHolder.Modules.fs.readdir("./SlashCommands/", async (err, files) => {
            let data = []
            if (files) {
              await files.map(async (folder) => {
                if (folder && folder.toLowerCase() !== 'testingcommands' && folder.toLowerCase() !== 'music' && folder.toLocaleLowerCase() !== 'owneronly') {
                  data.push(folder)
                }
              })
            }
            let allembed = new moduleHolder.Modules.discord.EmbedBuilder()
            await data.forEach(async folderName => {
              await moduleHolder.Modules.fs.readdir("./SlashCommands/" + folderName + "/", async (err, jsfiles) => {
                let data = []
                if (jsfiles.length !== 0) {
                  await jsfiles.map(async (cmdFilles) => {
                    let props = require(`../SlashCommands/${folderName}/${cmdFilles}`);
                    if (props) {
                      data.push(`\`${props.help.name}\``)
                    }
                  })
                  allembed.addFields([{ name: `${folderName} (${jsfiles.length})`, value: `${data}` }])
                }
              })
            })

            setTimeout(async () => {
              allembed.setTitle('All commands')
              allembed.setColor(moduleHolder.Modules.discord.Colors.Blue)
              allembed.setFooter({ text: `Requested by: ${interaction.user.username}#${interaction.user.discriminator} | AtomBOT` })
              await interaction.followUp({ embeds: [allembed], ephemeral: true }).catch(err => console.err);
            }, 1000)

          })
        }

        if (interaction.values.length > 0 && interaction.values[0] !== 'AllCmds' && interaction.values[0] !== 'EmptySlot') {

          await moduleHolder.Modules.fs.readdir(`./SlashCommands/${interaction.values[0]}`, async (err, jsfiles) => {
            if (jsfiles) {
              let data = []
              jsfiles.map(async (cmdFilles) => {
                let props = require(`../SlashCommands/${interaction.values[0]}/${cmdFilles}`);
                data.push(`**/${interaction.values[0]} ${props.help.name}**`)
              })

              let Embed = new moduleHolder.Modules.discord.EmbedBuilder()
                .setTitle(`${data.length} ${interaction.values[0]} Commands`)
                .setDescription(`${data.join('\n')}\n\n\`For command info use /help info <command category> <command name>\``)
                .setFooter({ text: `Requested by: ${interaction.user.username}#${interaction.user.discriminator} | AtomBOT`, iconURL: member.user.displayAvatarURL({ dynamic: true }) })
                .setColor(moduleHolder.Modules.discord.Colors.Blue)
                .setTimestamp()
              await interaction.followUp({ embeds: [Embed], ephemeral: true }).catch(err => console.err);

            } else {
              return interaction.followUp({ content: `Could not find any folder named ${interaction.values[0].toLowerCase()}!`, ephemeral: true }).catch(err => console.err);
            }
          })
        }
      }


      // SelfRole
      if (interaction.customId.includes(`SelfroleMenu_${interaction.guild.id}_`)) {
        const selfroleSettings = await bot.selfRoleServices.GetAsync(interaction.guild.id) || null;
        if (selfroleSettings && selfroleSettings.Enabled == true) {
          let FetchedRole = await interaction.message.guild.roles.cache.find(rol => rol.id === interaction.values[0]) || null;
          if (!FetchedRole) return interaction.followUp({ content: `Error finding role with id: ${interaction.values[0]}`, ephemeral: true }).catch(err => console.err)
          if (!interaction.member.roles.cache.has(FetchedRole.id)) {
            await interaction.member.roles.add(FetchedRole.id).catch(err => {
              return interaction.followUp({ content: `Somthing went whrong -> ${err}`, ephemeral: true }).catch(err => console.err);
            });
            let AddEmbed = new moduleHolder.Modules.discord.EmbedBuilder()
              .setColor(moduleHolder.Modules.discord.Colors.Green)
              .setDescription(`**Succesfully added role: ${FetchedRole}**`)
            return interaction.followUp({ embeds: [AddEmbed], ephemeral: true }).catch(err => console.err)
          } else {
            await interaction.member.roles.remove(FetchedRole.id).catch(err => {
              return interaction.followUp({ content: `Somthing went whrong -> ${err}`, ephemeral: true }).catch(err => console.err);
            });
            let RemEmbed = new moduleHolder.Modules.discord.EmbedBuilder()
              .setColor(moduleHolder.Modules.discord.Colors.Red)
              .setDescription(`**Succesfully removed role: ${FetchedRole}**`)
            return interaction.followUp({ embeds: [RemEmbed], ephemeral: true }).catch(err => console.err)
          }
        }
      }

    }


    if (interaction.componentType === 2) {
      //gieaway system
      if (interaction.customId == `giveaway_enter_${interaction.guild.id}`) {
        let fetchedGiveaway = await bot.giveawayServices.GetAsync(interaction.guild.id, interaction.message.id) || null;
        if (!fetchedGiveaway) return interaction.followUp({ content: `There is no giveaway with message id: ${interaction.message.id}`, ephemeral: true })
        if (fetchedGiveaway.Ended == true) return interaction.followUp({ content: `This giveaway already ended`, ephemeral: true })
        // check if the member has one of the exclude roles
        if (interaction.member.roles.cache.filter(role => fetchedGiveaway.ExcludeRoleIds.includes(role.id)).some(x => x)) return interaction.followUp({ content: `You can not enter this giveaway because of your current roles.`, ephemeral: true })
        // check if the member already joined the giveaway
        if (fetchedGiveaway.Attendees.filter(a => a == interaction.member.id).some(x => x)) return interaction.followUp({ content: `Looks like you already entered this giveaway`, ephemeral: true })
        //get and compare the current messages count from the member with the required message count
        let memberMessageCount = await bot.memberMessageCountServices.GetAsync(interaction.guild.id, interaction.member.id) || new MemberMessageCountModel(interaction.guild.id, interaction.member.id, 0)
        if (Number(memberMessageCount.MessageCount) < Number(fetchedGiveaway.RequiredMessages)) return interaction.followUp({ content: `To enter this giveaway you need ${(Number(fetchedGiveaway.RequiredMessages) - Number(memberMessageCount.MessageCount))} more messages in this server.`, ephemeral: true })
        //get and compare the current level from the member with the required level
        let memberLevel = await bot.levelServices.GetMemberLevelAsync(interaction.guild.id, interaction.member.id) || new MemberLevelModel(interaction.guild.id, interaction.member.id);
        if (Number(memberLevel.Level) < Number(fetchedGiveaway.RequiredLevel)) return interaction.followUp({ content: `To enter this giveaway you need ${(Number(fetchedGiveaway.RequiredLevel) - Number(memberLevel.Level))} more levels in this server.`, ephemeral: true })
        //get and compare the current invite stays from the member with the required invites
        const memberInvites = await bot.inviteServices.GetMemberInvitesAsync(interaction.guild.id, interaction.member.id) || new MemberInvitesModel(interaction.guild.id, interaction.member.id);
        if (Number(memberInvites.Stays) < Number(fetchedGiveaway.RequiredInvites)) return interaction.followUp({ content: `To enter this giveaway you need to invite ${(Number(fetchedGiveaway.RequiredInvites) - Number(memberInvites.Stays))} members that are staying in this server.`, ephemeral: true })
        // required invites
        fetchedGiveaway.Attendees.push(interaction.member.id);
        let saved = await bot.giveawayServices.UpdateAsync(fetchedGiveaway) || null;
        switch (saved?.acknowledged ?? false) {
          case true:
            interaction.followUp({ content: `You succesfully entered this giveaway, new total entries: ${fetchedGiveaway.Attendees.length}`, ephemeral: true })
            break;
          case false:
            interaction.followUp({ content: `Somthing went whrong joining the giveaway.`, ephemeral: true })
            break;
        }
      }
      if (interaction.customId == `giveaway_leave_${interaction.guild.id}`) {
        let fetchedGiveaway = await bot.giveawayServices.GetAsync(interaction.guild.id, interaction.message.id) || null;
        if (!fetchedGiveaway) return interaction.followUp({ content: `There is no giveaway with message id: ${interaction.message.id}`, ephemeral: true })
        if (fetchedGiveaway.Ended == true) return interaction.followUp({ content: `This giveaway already ended`, ephemeral: true })
        if (!fetchedGiveaway.Attendees.filter(a => a == interaction.member.id).some(x => x)) return interaction.followUp({ content: `Looks like you did not enter this giveaway yet`, ephemeral: true })
        fetchedGiveaway.Attendees = fetchedGiveaway.Attendees.filter(a => a != interaction.member.id);
        let saved = await bot.giveawayServices.UpdateAsync(fetchedGiveaway) || null;
        switch (saved?.acknowledged ?? false) {
          case true:
            interaction.followUp({ content: `You succesfully left this giveaway, new total entries: ${fetchedGiveaway.Attendees.length}`, ephemeral: true })
            break;
          case false:
            interaction.followUp({ content: `Somthing went whrong joining the giveaway.`, ephemeral: true })
            break;
        }
      }
      if (interaction.customId == `giveaway_info_${interaction.guild.id}`) {
        let fetchedGiveaway = await bot.giveawayServices.GetAsync(interaction.guild.id, interaction.message.id) || null;
        if (!fetchedGiveaway) return interaction.followUp({ content: `There is no giveaway with message id: ${interaction.message.id}`, ephemeral: true })
        if (fetchedGiveaway.Ended == true) return interaction.followUp({ content: `This giveaway already ended`, ephemeral: true })
        let gvwDate = fetchedGiveaway.Time
        let gvwFormatDate = moduleHolder.Modules.moment(gvwDate)
        let relative = `${gvwFormatDate}`
        if (gvwFormatDate) {
          relative = moduleHolder.Modules.discordBuilder.time(gvwFormatDate._d, 'R') || ''
        }
        let embed = new moduleHolder.Modules.discord.EmbedBuilder()
        embed.setTitle(`Giveaway Info`)
        embed.setColor(moduleHolder.Modules.discord.Colors.Blue)
        embed.addFields([
          { name: "Prize", value: `${fetchedGiveaway.Prize ?? "Unknown"}` },
          { name: "Winners", value: `${fetchedGiveaway.Winners ?? "Unknown"}` },
          { name: "RequiredInvites", value: `${fetchedGiveaway.RequiredInvites ?? "Unknown"}` },
          { name: "RequiredMessages", value: `${fetchedGiveaway.RequiredMessages ?? "Unknown"}` },
          { name: "RequiredLevel", value: `${fetchedGiveaway.RequiredLevel ?? "Unknown"}` },
          { name: "Ends", value: `${relative ?? "Unknown"}` },
          { name: "ExcludeRoleIds", value: `${fetchedGiveaway.ExcludeRoleIds && fetchedGiveaway.ExcludeRoleIds.length > 0 ? fetchedGiveaway.ExcludeRoleIds.map(r => `<@&${r}>`) : "None"}` },
          { name: "Attendees", value: `${fetchedGiveaway.Attendees && fetchedGiveaway.Attendees.length > 0 ? fetchedGiveaway.Attendees.length : 0}` }
          //{ name: "Attendees", value: `${fetchedGiveaway.Attendees && fetchedGiveaway.Attendees.length > 0 ? fetchedGiveaway.Attendees.map(r => `<@${r}>`) : "None"}` }
        ])
        interaction.followUp({ embeds: [embed], ephemeral: true }).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err);
      }






      // ticket system

      //open ticket
      if (interaction.customId == `open_ticket_${interaction.guild.id}`) {
        const ticketSettings = await bot.ticketServices.GetAsync(interaction.guild.id) || new TicketModel(interaction.guild.id);
        if (ticketSettings && ticketSettings.Enabled == true) {
          // check if member already has an open ticket
          let userAlreadyHasOpenTicket = await bot.ticketServices.GetOpenTicketByMemberAsync(interaction.guild.id, interaction.member.id) || null;
          if (userAlreadyHasOpenTicket != null && await interaction.guild.channels.cache.get(userAlreadyHasOpenTicket.ChannelId)) return interaction.followUp({ content: `Looks like you already have an open ticket -> <#${userAlreadyHasOpenTicket.ChannelId}>`, ephemeral: true }).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err);

          interaction.guild.channels.create({ name: `Ticket-${(ticketSettings?.TotalOpenedTickets ?? 0) + 1}`, type: 0 }).then(async createdChan => {
            createdChan.setParent(ticketSettings.CategoryId).catch(e => { })

            // add everyone perms
            let everyone = await interaction.guild.roles.cache.find(r => r.name === '@everyone') || null
            if (!everyone) return interaction.followUp({ content: `Somthing went whrong opening your ticket -> ${err}.`, ephemeral: true }).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err);
            await createdChan.permissionOverwrites.create(everyone, {
              ManageMessages: false,
              SendMessages: false,
              ViewChannel: false,
              AddReactions: false,
              ReadMessageHistory: false,
              AttachFiles: false
            }).catch(err => { });

            // add ticket member and tag roles perms
            await createdChan.permissionOverwrites.create(interaction.member.id, {
              ManageMessages: false,
              SendMessages: true,
              ViewChannel: true,
              AddReactions: true,
              ReadMessageHistory: true,
              AttachFiles: true
            }).catch(err => console.err);
            for (const id of ticketSettings?.RolesToTagIds ?? []) {
              await createdChan.permissionOverwrites.create(id, {
                ManageMessages: false,
                SendMessages: true,
                ViewChannel: true,
                AddReactions: true,
                ReadMessageHistory: true,
                AttachFiles: true
              }).catch(err => console.err);
            }

            var embedParent = new moduleHolder.Modules.discord.EmbedBuilder()
              .setAuthor({ name: `Hi, ${interaction.member.user.tag}`, iconURL: interaction.member.user.displayAvatarURL({ dynamic: true }) })
              .setTitle(`Ticket: ${(ticketSettings?.TotalOpenedTickets ?? 0) + 1}`)
              .setDescription(`${validatorHelper.ReplaceStringTags(ticketSettings.TicketOpenedMessage, interaction.guild, interaction.member)}`)
              .setColor(moduleHolder.Modules.discord.Colors.Blue)
              .setFooter({ text: `❌ = Close` });
            let btn = new moduleHolder.Modules.discord.ButtonBuilder()
              .setCustomId(`close_ticket_${interaction.guild.id}`)
              .setLabel(`Close Ticket`)
              .setEmoji(`❌`)
              .setStyle(4)
            let ButtonsToAdd = new moduleHolder.Modules.discord.ActionRowBuilder()
              .addComponents(btn)

            const openTicketModel = new OpenTicketModel(((ticketSettings?.TotalOpenedTickets ?? 0) + 1), interaction.guild.id, createdChan.id, interaction.member.id);
            const saved = await bot.ticketServices.SetOpenTicketAsync(openTicketModel);
            switch (saved?.acknowledged ?? false) {
              case true:
                interaction.followUp({ content: `Ticket has been created -> ${createdChan}`, ephemeral: true }).catch(err => console.error);
                break;
              case false:
                interaction.followUp({ content: `Somthing went whrong saving your ticket to the db.`, ephemeral: true }).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err);
                break;
            }

            await createdChan.send({
              content: `${interaction.member} ${ticketSettings.RolesToTagIds.length > 0 ? `, ${ticketSettings.RolesToTagIds.map(r => interaction.guild.roles.cache.get(r ?? "000"))}` : ""}`,
              embeds: [embedParent],
              "components": [ButtonsToAdd]
            }).then(async ticketMessage => {

              ticketSettings.TotalOpenedTickets++;
              await bot.ticketServices.SetAsync(ticketSettings);

              //send log
              let ticketLogChannel = await interaction.guild.channels.cache.get(ticketSettings?.LogChannelId ?? "000");
              let reopenEmbed = new moduleHolder.Modules.discord.EmbedBuilder()
                .setAuthor({ name: `Ticket Opened`, iconURL: interaction.member.user.displayAvatarURL({ dynamic: true }) })
                .addFields([
                  { name: `Executor:`, value: `${interaction.member.user.tag} | ${interaction.member}` },
                  { name: `Channel:`, value: `${ticketMessage.channel.name} | ${ticketMessage.channel}` }
                ])
                .setColor(moduleHolder.Modules.discord.Colors.Blue)
              ticketLogChannel?.send({ embeds: [reopenEmbed] }).catch(err => console.err);

            }).catch(async e => {
              await bot.ticketServices.RemoveOpenTicketByChannelAsync(openTicketModel);
              await bot.ticketServices.delete(ticketSettings);
              interaction.followUp({ content: `Somthing went whrong opening your ticket -> ${e}.`, ephemeral: true }).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err);
            })
          }).catch(err => {
            interaction.followUp({ content: `Somthing went whrong opening your ticket -> ${err}.`, ephemeral: true }).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err);
          });
        } else {
          interaction.followUp({ content: `Looks like the ticket system is disabled.`, ephemeral: true }).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err);
        }
      }

      //close ticket
      if (interaction.customId == `close_ticket_${interaction.guild.id}`) {
        const ticketSettings = await bot.ticketServices.GetAsync(interaction.guild.id) || new TicketModel(interaction.guild.id);
        if (ticketSettings && ticketSettings.Enabled == true) {
          const openTicket = await bot.ticketServices.GetOpenTicketByChannelAsync(interaction.guild.id, interaction.channel.id) || null;
          if (!openTicket) return interaction.followUp({ content: `Looks like this ticket doesnt exist in the db anymore.`, ephemeral: true }).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err);

          // remove previous embed buttons
          interaction.message.edit({
            "components": []
          }).catch(e => { })

          // add ticket member and tag roles perms
          await interaction.channel.permissionOverwrites.create(openTicket.TicketMemberId, {
            ManageMessages: false,
            SendMessages: false,
            ViewChannel: true,
            AddReactions: true,
            ReadMessageHistory: true,
            AttachFiles: false
          }).catch(err => console.err);
          for (const id of ticketSettings?.RolesToTagIds ?? []) {
            await interaction.channel.permissionOverwrites.create(id, {
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
            .setCustomId(`delete_ticket_${interaction.guild.id}`)
            .setLabel(`Delete`)
            .setEmoji(`❌`)
            .setStyle(4)
          let trans = new moduleHolder.Modules.discord.ButtonBuilder()
            .setCustomId(`transcript_ticket_${interaction.guild.id}`)
            .setLabel(`Transcript`)
            .setEmoji(`🎫`)
            .setStyle(1)
          let reopen = new moduleHolder.Modules.discord.ButtonBuilder()
            .setCustomId(`reopen_ticket_${interaction.guild.id}`)
            .setLabel(`ReOpen`)
            .setEmoji(`✅`)
            .setStyle(1)
          let ButtonsToAdd = new moduleHolder.Modules.discord.ActionRowBuilder()
            .addComponents(del)
            .addComponents(trans)
            .addComponents(reopen)
          await interaction.channel.send({
            content: null,
            embeds: [embedParent],
            "components": [ButtonsToAdd]
          }).catch(e => {
            interaction.followUp({ content: `Somthing went whrong closing your ticket -> ${e}.`, ephemeral: true }).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err);
          })

          //send log
          let ticketLogChannel = await interaction.guild.channels.cache.get(ticketSettings?.LogChannelId ?? "000");
          let reopenEmbed = new moduleHolder.Modules.discord.EmbedBuilder()
            .setAuthor({ name: `Ticket Closed`, iconURL: interaction.member.user.displayAvatarURL({ dynamic: true }) })
            .addFields([
              { name: `Executor:`, value: `${interaction.member.user.tag} | ${interaction.member}` },
              { name: `Channel:`, value: `${interaction.channel.name} | ${interaction.channel}` }
            ])
            .setColor(moduleHolder.Modules.discord.Colors.Blue)
          ticketLogChannel?.send({ embeds: [reopenEmbed] }).catch(err => console.err);
        } else {
          interaction.followUp({ content: `Looks like the ticket system is disabled.`, ephemeral: true }).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err);
        }
      }


      //reopen ticket
      if (interaction.customId == `reopen_ticket_${interaction.guild.id}`) {
        const ticketSettings = await bot.ticketServices.GetAsync(interaction.guild.id) || new TicketModel(interaction.guild.id);
        if (ticketSettings && ticketSettings.Enabled == true) {
          const openTicket = await bot.ticketServices.GetOpenTicketByChannelAsync(interaction.guild.id, interaction.channel.id) || null;
          if (!openTicket) return interaction.followUp({ content: `Looks like this ticket doesnt exist in the db anymore.`, ephemeral: true }).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err);

          var ticketMember = interaction.guild.members.cache.get(openTicket.TicketMemberId) || null;
          if (!ticketMember) return interaction.followUp({ content: `Unable to fetch ticket memeber.`, ephemeral: true }).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err);

          // remove previous embed buttons
          interaction.message.edit({
            "components": []
          }).catch(e => { })

          await interaction.channel.permissionOverwrites.create(openTicket.TicketMemberId, {
            ManageMessages: false,
            SendMessages: true,
            ViewChannel: true,
            AddReactions: true,
            ReadMessageHistory: true,
            AttachFiles: true
          }).catch(err => console.err);
          for (const id of ticketSettings?.RolesToTagIds ?? []) {
            await interaction.channel.permissionOverwrites.create(id, {
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
            .setDescription(`${validatorHelper.ReplaceStringTags(ticketSettings.TicketOpenedMessage, interaction.guild, interaction.member)}`)
            .setColor(moduleHolder.Modules.discord.Colors.Blue)
            .setFooter({ text: `❌ = Close` });
          let btn = new moduleHolder.Modules.discord.ButtonBuilder()
            .setCustomId(`close_ticket_${interaction.guild.id}`)
            .setLabel(`Close Ticket`)
            .setEmoji(`❌`)
            .setStyle(4)
          let ButtonsToAdd = new moduleHolder.Modules.discord.ActionRowBuilder()
            .addComponents(btn)

          await interaction.channel.send({
            content: `${ticketMember} ${ticketSettings.RolesToTagIds.length > 0 ? `, ${ticketSettings.RolesToTagIds.map(r => interaction.guild.roles.cache.get(r ?? "000"))}` : ""}`,
            embeds: [embedParent],
            "components": [ButtonsToAdd]
          }).catch(e => {
            interaction.followUp({ content: `Somthing went whrong reopening your ticket -> ${e}.`, ephemeral: true }).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err);
          })

          //send log
          let ticketLogChannel = await interaction.guild.channels.cache.get(ticketSettings?.LogChannelId ?? "000");
          let reopenEmbed = new moduleHolder.Modules.discord.EmbedBuilder()
            .setAuthor({ name: `Ticket Re-Opened`, iconURL: interaction.member.user.displayAvatarURL({ dynamic: true }) })
            .addFields([
              { name: `Executor:`, value: `${interaction.member.user.tag} | ${interaction.member}` },
              { name: `Channel:`, value: `${interaction.channel.name} | ${interaction.channel}` }
            ])
            .setColor(moduleHolder.Modules.discord.Colors.Blue)
          ticketLogChannel?.send({ embeds: [reopenEmbed] }).catch(err => console.err);

        } else {
          interaction.followUp({ content: `Looks like the ticket system is disabled.`, ephemeral: true }).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err);
        }
      }

      //delete ticket
      if (interaction.customId == `delete_ticket_${interaction.guild.id}`) {
        const ticketSettings = await bot.ticketServices.GetAsync(interaction.guild.id) || new TicketModel(interaction.guild.id);
        if (ticketSettings && ticketSettings.Enabled == true) {
          const openTicket = await bot.ticketServices.GetOpenTicketByChannelAsync(interaction.guild.id, interaction.channel.id) || null;
          if (!openTicket) return interaction.followUp({ content: `Looks like this ticket doesnt exist in the db anymore.`, ephemeral: true }).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err);

          const isInExcludeRole = interaction.member.roles.cache.filter(role => ticketSettings.RolesToTagIds.includes(role.id)).some(x => x);
          if (!isInExcludeRole && !interaction.member.permissions.has(moduleHolder.Modules.discord.PermissionFlagsBits.ManageMessages)) return interaction.followUp({ content: `You need permissions **ManageMessages** or the ticketrole to be able to delete ticket channels!`, ephemeral: true }).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err);

          //send log
          let ticketLogChannel = await interaction.guild.channels.cache.get(ticketSettings?.LogChannelId ?? "000");
          let involvedUsers = [];

          await openTicket.TicketMessages.forEach(async m => {
            try {
              let toJson = JSON.parse(m);
              if (toJson && toJson.authorId && !involvedUsers.includes(toJson.authorId)) {
                involvedUsers.push(toJson.authorId);
              }
            } catch (e) { }
          })

          await bot.ticketServices.RemoveOpenTicketByChannelAsync(openTicket);

          let reopenEmbed = new moduleHolder.Modules.discord.EmbedBuilder()
            .setAuthor({ name: `Ticket Deleted`, iconURL: interaction.member.user.displayAvatarURL({ dynamic: true }) })
            .addFields([
              { name: `Executor:`, value: `${interaction.member.user.tag} | ${interaction.member}` },
              { name: `Ticket ID:`, value: `${openTicket.TicketId ?? "Unknown"}` },
              { name: `Ticket User:`, value: `<@${openTicket.TicketMemberId}> | ${openTicket.TicketMemberId}` },
              { name: `Tagged Ids:`, value: `${ticketSettings.RolesToTagIds.length > 0 ? ticketSettings.RolesToTagIds.map(r => `<@&${r}>`) : 'None'}` },
              { name: `Involved Users:`, value: `${involvedUsers.length > 0 ? involvedUsers.map(u => `<@${u}>`) : `Unknown`}` },
              { name: `Ticket Opened:`, value: `${moduleHolder.Modules.discordBuilder.time((moduleHolder.Modules.moment(openTicket.TicketOpened))._d, 'R')}` },
            ])
            .setColor(moduleHolder.Modules.discord.Colors.Blue)
          ticketLogChannel?.send({ embeds: [reopenEmbed] }).then(async m => {
            await bot.ticketServices.SaveTranscription(m, openTicket, true);
          }).catch(err => console.err);

          interaction.channel.delete().catch(e => {
            interaction.followUp({ content: `Error deleting channel -> ${e}.`, ephemeral: true }).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err);
          });
        } else {
          interaction.followUp({ content: `Looks like the ticket system is disabled.`, ephemeral: true }).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err);
        }
      }





      //transcript ticket
      if (interaction.customId == `transcript_ticket_${interaction.guild.id}`) {
        const ticketSettings = await bot.ticketServices.GetAsync(interaction.guild.id) || new TicketModel(interaction.guild.id);
        if (ticketSettings && ticketSettings.Enabled == true) {
          const openTicket = await bot.ticketServices.GetOpenTicketByChannelAsync(interaction.guild.id, interaction.channel.id) || null;
          if (!openTicket) return interaction.followUp({ content: `Looks like this ticket doesnt exist in the db anymore.`, ephemeral: true }).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err);

          await bot.ticketServices.SaveTranscription(interaction, openTicket, false, interaction.member);
          interaction.followUp({ content: `You should have a dm with the transcription`, ephemeral: true }).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err)

          //send log
          let ticketLogChannel = await interaction.guild.channels.cache.get(ticketSettings?.LogChannelId ?? "000");
          let reopenEmbed = new moduleHolder.Modules.discord.EmbedBuilder()
            .setAuthor({ name: `Ticket Transcript Requested`, iconURL: interaction.member.user.displayAvatarURL({ dynamic: true }) })
            .addFields([
              { name: `Executor:`, value: `${interaction.member.user.tag} | ${interaction.member}` },
              { name: `Channel:`, value: `${interaction.channel.name} | ${interaction.channel}` }
            ])
            .setColor(moduleHolder.Modules.discord.Colors.Blue)
          ticketLogChannel?.send({ embeds: [reopenEmbed] }).catch(err => console.err);
        } else {
          interaction.followUp({ content: `Looks like the ticket system is disabled.`, ephemeral: true }).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err);
        }
      }





      //verification verify system
      if (interaction.customId == `verify_reactionrole_${interaction.guild.id}`) {
        const verificationSettings = await bot.verificationServices.GetAsync(interaction.guild.id) || new VerificationModel(interaction.guild.id);
        if (verificationSettings && verificationSettings.Enabled == true) {
          let verifyedRole = interaction.guild.roles.cache.get(verificationSettings?.VerifiedRoleId ?? "000") || null;
          let unVerifyedRole = interaction.guild.roles.cache.get(verificationSettings?.UnVerifiedRoleId ?? "000") || null;
          if (verifyedRole) {
            if (interaction.member.roles.cache.has(verifyedRole.id)) {
              if (unVerifyedRole && !interaction.member.roles.cache.has(unVerifyedRole.id)) {
                await interaction.member.roles.add(unVerifyedRole.id).catch(err => {
                  interaction.followUp({ content: `Error adding unverifyed role -> ${err}.`, ephemeral: true }).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err);
                });
              }
              await interaction.member.roles.remove(verifyedRole.id).catch(err => {
                interaction.followUp({ content: `Error removing verifyed role -> ${err}.`, ephemeral: true }).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err);
              });
              interaction.followUp({ content: `You succesfully un-verifyed.`, ephemeral: true }).catch(err => console.err);
            } else {
              if (unVerifyedRole && interaction.member.roles.cache.has(unVerifyedRole.id)) {
                await interaction.member.roles.remove(unVerifyedRole.id).catch(err => {
                  interaction.followUp({ content: `Error removing unverifyed role -> ${err}.`, ephemeral: true }).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err);
                });
              }
              await interaction.member.roles.add(verifyedRole.id).catch(err => {
                interaction.followUp({ content: `Error adding verifyed role -> ${err}.`, ephemeral: true }).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err);
              });
              var embed = new moduleHolder.Modules.discord.EmbedBuilder()
                .setColor(moduleHolder.Modules.discord.Colors.Blue)
                .setTitle(`Succesfully verifyed`)
                .setThumbnail(interaction.guild.iconURL())
                .setDescription(`${validatorHelper.ReplaceStringTags(verificationSettings?.VerifiedMessage ?? `Succesfully verifyed in ${interaction.guild.name}`, interaction.guild, interaction.member)}`)
                .setFooter({ text: `Verification System`, iconURL: interaction.member.user.displayAvatarURL({ dynamic: true, extension: 'png' }) })
                .setTimestamp();
              interaction.member.send({ embeds: [embed] }).catch(error => { });
              interaction.followUp({ content: `You succesfully verifyed.`, ephemeral: true }).catch(err => console.err);
            }
          } else {
            interaction.followUp({ content: `Looks like i could not find the verifyed role.`, ephemeral: true }).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err);
          }
        }
      }


      // Remove all selfrole roles
      if (interaction.customId === `remove_all_roles_${interaction.guild.id}`) {
        const selfroleSettings = await bot.selfRoleServices.GetAsync(interaction.guild.id) || null;
        if (selfroleSettings && selfroleSettings.Enabled == true && selfroleSettings.RoleIds.length > 0) {
          selfroleSettings.RoleIds.map(async roleId => {
            let FetchedRole = await interaction.message.guild.roles.cache.find(rol => rol.id === roleId) || null;
            if (FetchedRole) {
              if (interaction.member.roles.cache.has(FetchedRole.id))
                interaction.member.roles.remove(FetchedRole.id).catch(e => { })
            }
          })
          let RemEmbed = new moduleHolder.Modules.discord.EmbedBuilder()
            .setColor(moduleHolder.Modules.discord.Colors.Red)
            .setDescription(`**Succesfully removed all selfrole roles**`)
          return interaction.followUp({ embeds: [RemEmbed], ephemeral: true }).catch(err => console.err)
        }
      }

    }

  }





}
