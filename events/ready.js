const ModuleHolder = require("../Classes/ModuleHolder");
const GuildInviteModel = require("../Models/GuildInviteModel");
const ServerStatsModel = require("../Models/ServerStatsModel");
const TicketModel = require("../Models/TicketModel");
const moduleHolder = new ModuleHolder();
module.exports = async (bot) => {

    // Console log on botStart
    // if (bot.shard.ids[0] === 0)
    console.log('\x1b[36m', `_____________________________\n`);
    console.log('\x1b[31m', `Logged in as ${bot.user.username}`);
    console.log('\x1b[31m', `Serving ${bot.guilds.cache.size} servers`);
    console.log('\x1b[33m', `Serving ${bot.channels.cache.size} channels`);
    console.log('\x1b[33m', `Serving ${bot.guilds.cache.reduce((a, g) => a + g.memberCount, 0)} users`);
    console.log('\x1b[32m', `Running SlashCommands: ${bot.SlashCommands.size}`)
    console.log('\x1b[32m', `Running Events: ${bot._eventsCount}`)
    console.log('\x1b[36m', '\n_____________________________');
    // await moduleHolder.Modules.dash.Dash(bot).then(console.log('DashBoard Online!')).catch(e => console.log(`DashBoard ERR: ${e.stack}`))

    //🔒-----👉-----👀-----🌟➕ Alert on bot restart ➕🌟-----👀-----👈-----🔒
    let embedToSend = new moduleHolder.Modules.discord.EmbedBuilder()
        .setAuthor({ name: "Bot has has been rebooted", iconURL: bot.user.displayAvatarURL({ dynamic: true, extension: 'png' }) })
        .setColor(moduleHolder.Modules.discord.Colors.Blue)
        .setDescription(`Loaded **${bot.SlashCommands.size}** commands.\nServing **${bot.guilds.cache.reduce((a, g) => a + g.memberCount, 0)}** users.\nServing **${bot.guilds.cache.size}** servers.`)
        .setTimestamp();
    const updatechannel = bot.channels.cache.get(moduleHolder.Modules.private.rebootLog) || null;
    if (updatechannel) {
        updatechannel.send({ embeds: [embedToSend] }).catch(err => console.error);
    }


    // load guild invites to the db
    bot.inviteServices.LoadGuildInvited(bot);


    setInterval(async () => {
        //status loop
        let statuses = [
            `SlashCommand Filles: ${(bot.SlashCommands.size).toLocaleString()}`,
            `Serving servers: ${bot.guilds.cache.size.toLocaleString()}`,
            `Serving channels: ${bot.channels.cache.size.toLocaleString()}`,
            `Serving users: ${bot.guilds.cache.reduce((a, g) => a + g.memberCount, 0).toLocaleString()}`,
            `Shards: ${bot.shard.count.toLocaleString()}`
        ];
        let status = statuses[Math.floor(Math.random() * statuses.length)];
        bot.user.setActivity(status, {
            type: moduleHolder.Modules.discord.ActivityType.Watching,
        });

    }, 10000);


    setInterval(async () => {
        bot.guilds.cache.forEach(async guild => {
            let fetchedGiveaway = await bot.giveawayServices.GetAllAsync(guild.id) || null;
            if (fetchedGiveaway && fetchedGiveaway.length > 0) {
                fetchedGiveaway.forEach(async giveaway => {
                    if (giveaway.Ended == false && giveaway.Time < Date.now()) {
                        let giveawayMessage = await guild.channels.cache.get(giveaway.ChannelId)?.messages.fetch(giveaway.MessageId).catch(e => { }) || null
                        if (giveawayMessage) {
                            if (giveaway.Attendees && giveaway.Attendees.length > 0) {
                                let PplEntered = []
                                let winners = []
                                await giveaway.Attendees.map(async user => {
                                    let member = await guild.members.cache.get(user) || null;
                                    if (member !== null && !member.roles.cache.filter(role => giveaway.ExcludeRoleIds.includes(role.id)).some(x => x)) { PplEntered.push(member.id) }
                                })
                                if (Number(PplEntered.length) < giveaway.Winners) {
                                    return giveawayMessage.reply(`${moduleHolder.Modules.emojie.error} Looks like there not enough entries to chose ${giveaway.Winners} winners!`).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err);
                                } else {
                                    for (var i = 0; i < giveaway.Winners; i++) {
                                        inList = false;
                                        random = Math.floor(Math.random() * PplEntered.length);
                                        for (var y = 0; y < winners.length; y++) {
                                            if (winners[y] === PplEntered[random]) {
                                                i--;
                                                inList = true;
                                                break;
                                            }
                                        }
                                        if (!inList) {
                                            winners.push(PplEntered[random]);
                                        }
                                    }

                                    let editEmbed = new moduleHolder.Modules.discord.EmbedBuilder()
                                        .setTitle(`Giveaway Ended!`)
                                        .setDescription(`**Prize:** \`${giveaway.Prize}\`\n**Winners:**\n${winners.map(w => `<@${w}>`).join('\n')}\n\nGiveaway ended with ${PplEntered.length} entrie(s).`)
                                        .setFooter({ text: `Giveaway sys`, iconURL: `${bot.user.displayAvatarURL({ extension: 'png' })}` })
                                    giveawayMessage.edit({ embeds: [editEmbed], "components": [] }).catch(e => { })
                                    let winnersEmbed = new moduleHolder.Modules.discord.EmbedBuilder()
                                        .setDescription(`[**Congrats You won the giveaway!**](https://discord.com/channels/${guild.id}/${giveaway.ChannelId}/${giveaway.MessageId})`)
                                    giveawayMessage.reply({
                                        content: `${winners.map(w => `<@${w}>`).join('\n')}`,
                                        embeds: [winnersEmbed]
                                    });
                                    for (var i = 0; i < winners.length; i++) {
                                        let dmUser = await guild.members.cache.get(winners[i]) || null;
                                        if (dmUser !== null) {
                                            let winnersEmbed = new moduleHolder.Modules.discord.EmbedBuilder()
                                                .setDescription(`**Congrats** You won the giveaway **${giveaway.Prize}**. ${moduleHolder.Modules.emojie.giveaway2}${moduleHolder.Modules.emojie.giveaway2}\nGet your prize in server: **${guild.name}** befor your to late!\n\n[Giveaway message url](https://discord.com/channels/${guild.id}/${giveaway.ChannelId}/${giveaway.MessageId})`)
                                            dmUser.send({ embeds: [winnersEmbed] }).catch(err => console.err)
                                        }
                                    }
                                    if (giveaway.LogChannelId && giveaway.LogChannelId != "000") {
                                        let logChannel = guild.channels.cache.get(giveaway?.LogChannelId ?? "000") || null;
                                        let embed = new moduleHolder.Modules.discord.EmbedBuilder()
                                            .setColor(moduleHolder.Modules.discord.Colors.Blue)
                                            .setAuthor({ name: `Giveaway has been ended!`, iconURL: `${bot.user.displayAvatarURL({ extension: 'png' })}`, url: `https://discord.com/channels/${guild.id}/${giveaway.ChannelId}/${giveaway.MessageId}` })
                                            .addFields([{ name: `Executor:`, value: `${bot.user} | ${bot.user.tag}` }])
                                        try { logChannel?.send({ embeds: [embed] }).catch(err => { }); } catch (e) { }

                                    }
                                }
                                giveaway.Ended = true;
                                giveaway.Time = Date.now();
                            } else {
                                let winnersEmbed = new moduleHolder.Modules.discord.EmbedBuilder()
                                    .setDescription(`[**There are no entries to this giveaway!**](https://discord.com/channels/${guild.id}/${giveaway.ChannelId}/${giveaway.MessageId})`)
                                giveawayMessage.reply({ embeds: [winnersEmbed] }).catch(e => { })
                                let editEmbed = new moduleHolder.Modules.discord.EmbedBuilder()
                                    .setTitle(`Giveaway Ended!`)
                                    .setDescription(`**Winners:**\nNone\n\n**Giveaway ended with** 0 **pntries**.\n\n**End Time:** ${moduleHolder.Modules.discordBuilder.time(new Date(), 'R')}`)
                                    .setFooter({ text: `Giveaway sys`, iconURL: `${bot.user.displayAvatarURL({ extension: 'png' })}` })
                                giveawayMessage.edit({ embeds: [editEmbed], "components": [] }).catch(e => { })

                                giveaway.Ended = true;
                                giveaway.Time = Date.now();
                            }
                            let saved = await bot.giveawayServices.UpdateAsync(giveaway) || null;
                            switch (saved?.acknowledged ?? false) {
                                case false:
                                    giveawayMessage.reply({ content: `${moduleHolder.Modules.emojie.error} Somthing went whrong saving the ended giveaway.` }).catch(e => { })
                                    break;
                            }
                        }
                    }
                });
            }
        });

    }, 180000);// 180000 -> 3min




    setInterval(async () => {
        bot.guilds.cache.forEach(async guild => {
            //stats
            const serverStatsSettings = await bot.serverStatsServices.GetAsync(guild.id) || new ServerStatsModel(guild.id);
            if (serverStatsSettings && serverStatsSettings.Enabled == true && guild && guild.members.me.permissions.has(moduleHolder.Modules.discord.PermissionFlagsBits.ManageChannels)) {
                let stats = {
                    TotalMembers: `Total Members: ${guild.memberCount || 0}`,
                    Members: `Members: ${guild.members.cache.filter(m => !m.user.bot).size || 0}`,
                    Bots: `Bots: ${guild.members.cache.filter(m => m.user.bot).size || 0}`,
                    OnlineMembers: `Online Members: ${guild.members.cache.filter(member => member.presence && member.presence.status.toLowerCase() === "online").size || 0}`,
                    OfflineMembers: `Offline Members: ${guild.members.cache.filter(member => member.presence && member.presence.status.toLowerCase() === "offline" || !member.presence).size || 0}`,
                    IdleMembers: `Idle Members: ${guild.members.cache.filter(member => member.presence && member.presence.status.toLowerCase() === "idle").size || 0}`,
                    DndMembers: `Dnd Members: ${guild.members.cache.filter(member => member.presence && member.presence.status.toLowerCase() === "dnd").size || 0}`,
                    LiveMembers: `Live Members: ${guild.members.cache.filter(member => member.presence && member.presence.status.toLowerCase() === "live" || member.presence && member.presence.status.toLowerCase() === "streaming").size || 0}`,
                    GuildRoleCount: `Guild Roles: ${guild.roles.cache.size - 1 || 0}`,
                    GuildChannelCount: `Guild Channels: ${guild.channels.cache.size || 0}`
                }
                for (const statsProperty in stats) {
                    if (serverStatsSettings[statsProperty] != null && serverStatsSettings[statsProperty] != "000") {
                        let fetchedChannel = guild.channels.cache.get(serverStatsSettings[statsProperty] ?? "000") || null;
                        if (fetchedChannel) {
                            try {
                                fetchedChannel.setName(stats[statsProperty])
                            } catch (e) { }
                        }
                    }
                }
            }

            // ticket queue
            const ticketSettings = await bot.ticketServices.GetAsync(guild.id) || new TicketModel(guild.id);
            if (ticketSettings && ticketSettings.Enabled == true) {
                let ticketCount = 0;
                let queueChannel = guild.channels.cache.get(ticketSettings?.QueueChannelId ?? "000") || null;
                if (queueChannel) {
                    let openDbTickets = await bot.ticketServices.GetAllOpenTicketsAsync(guild.id) || [];
                    await openDbTickets.forEach(dbTicket => {
                        if (guild.channels.cache.get(dbTicket?.ChannelId ?? "000")) {
                            ticketCount++;
                        }
                    });
                    queueChannel.setName(`📨 Ticket Queue: ${ticketCount}`)
                }
            }
        });

    }, 1800000); // 1800000 -> 30min




}




