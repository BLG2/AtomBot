
const ModuleHolder = require("../Classes/ModuleHolder");
const AntiSystemModel = require("../Models/AntiSystemModel");

const moduleHolder = new ModuleHolder();
module.exports = async (bot, channel) => {
  if (!channel || !channel.guild || channel.type === 1) return;
  const antiSystemSettings = await bot.antiSystemServices.GetAsync(channel.guild?.id ?? null) || new AntiSystemModel(channel.guild.id);

  //AntiDelete channels
  if (antiSystemSettings && antiSystemSettings.AntiDeleteChannels == true) {
    const entry = await channel.guild.fetchAuditLogs({ type: moduleHolder.Modules.discord.AuditLogEvent.ChannelDelete }).then(audit => audit.entries.filter(a => a.target.id == channel.id && a.actionType == "Delete" && a.createdTimestamp > Date.now() - 10000).sort(a => a.createdTimestamp).first()).catch(err => console.error) || null;
    if (entry !== null) {
      let theuser = channel.guild.members.cache.get(entry.executor.id) || null
      if (theuser !== null && theuser.id !== bot.user.id) {
        const isInExcludeRole = theuser.roles.cache.filter(role => antiSystemSettings.ExcludeRoleIds.includes(role.id)).some(x => x);
        const isInExcludeCategory = antiSystemSettings.ExcludeCategoryIds?.includes(channel?.parentId ?? "000") || false;

        if (!isInExcludeRole && !isInExcludeCategory) {
          await channel.guild.channels.create({
            name: channel.name,
            type: channel.type,
            nfsw: channel.nsfw,
            parent: channel.parent,
            position: channel.rawPosition,
            topic: channel.topic,
            viewable: channel.viewable,
            partial: channel.partial,
            permissionsLocked: channel.permissionsLocked,
            rateLimitPerUser: channel.rateLimitPerUser,
            viewable: channel.viewable,
            threads: channel.threads ? channel.threads.cache : null,
            permissionOverwrites: channel.permissionOverwrites.cache
          }).then(async kanal => {
            kanal.send(`Channel Restored!`).catch(err => console.err)
            // await kanal.createWebhook({
            //   name: 'Anti Delete Channel',
            //   avatar: `${bot.user.displayAvatarURL({ extension: 'png' })}`,
            // }).then(async webhook => {
            // let webhookClient = await new moduleHolder.Modules.discord.WebhookClient({ id: webhook.id, token: webhook.token }).catch(e => { }) || null;
            // if (webhook !== null && messageData.length > 0) {
            //   for (const messag of messageData) {
            //     if (messag !== null && messag !== undefined) {
            //       await moduleHolder.Modules.functions.sendWebhookMSG(channel.guild, messag, webhook).catch(err => console.log(`MoveMsgFunc ChanDel - ${err}`))
            //     }
            //   }
            // };
            // }).catch(error => console.error);
          }).catch(err => {
            console.log(err)
          })
        }

      }
    }
  }




}
