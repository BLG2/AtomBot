const AntiSystemModel = require("../Models/AntiSystemModel");
const ModuleHolder = require("../Classes/ModuleHolder");
const AutoRoleModel = require("../Models/AutoRoleModel");
const MemberInvitesModel = require("../Models/MemberInvitesModel");
const InviteModel = require("../Models/InviteModel");
const ValidatorHelperService = require("../Services/ValidatorHelperService");
const WelcomeLeaveModel = require("../Models/WelcomeLeaveModel");
const VerificationModel = require("../Models/VerificationModel");
const validator = new ValidatorHelperService();

const moduleHolder = new ModuleHolder();
module.exports = async (bot, member) => {
  if (!member || !member.guild) return;

  const antiSystemSettings = await bot.antiSystemServices.GetAsync(member.guild?.id ?? null) || new AntiSystemModel(member.guild.id);
  const autoRoleServices = await bot.autoRoleServices.GetAsync(member.guild?.id ?? null) || new AutoRoleModel(member.guild.id);
  const verificationSettings = await bot.verificationServices.GetAsync(member.guild?.id ?? null) || new VerificationModel(member.guild.id);

  //Add Unverifyed role if needed
  if (verificationSettings && verificationSettings.Enabled && member.guild.members.me.permissions.has(moduleHolder.Modules.discord.PermissionFlagsBits.ManageRoles)) {
    let unVerifyedRole = await member.guild.roles.cache.get(verificationSettings?.UnVerifiedRoleId ?? "000") || null;
    if (unVerifyedRole) {
      await member.roles.add(unVerifyedRole).catch(e => { })
    }
  }

  //Anti bots
  if (antiSystemSettings && antiSystemSettings.AntiBots && member && member.user.bot !== true && member.guild.members.me.permissions.has(moduleHolder.Modules.discord.PermissionFlagsBits.KickMembers)) {
    var embed = new moduleHolder.Modules.discord.EmbedBuilder()
      .setTitle("Bot Kicked")
      .setDescription("**A bot was invited to the server and kicked for security reasons** \n\n**Botname:** " + member.user.tag);
    if (member.guild.owner) {
      member.guild.owner.send({ embeds: [embed] }).catch(error => console.error);
      member.kick(`anti bot join`).catch(e => { })
    }
  }


  //AutoRoles
  if (autoRoleServices && autoRoleServices.Enabled && autoRoleServices.RoleIds && autoRoleServices.RoleIds.length > 0 && member.guild.members.me.permissions.has(moduleHolder.Modules.discord.PermissionFlagsBits.ManageRoles)) {
    await autoRoleServices.RoleIds.map(async roleId => {
      let role = await member.guild.roles.cache.get(roleId ?? "000") || null;
      if (role) {
        await member.roles.add(role).catch(e => { })
      }
    })
  }


  //Welcome Messages
  const welcomeSettings = await bot.guildSettingsServices.GetWelcomeLeaveAsync(member.guild.id) || new WelcomeLeaveModel(member.guild.id);
  if (welcomeSettings && welcomeSettings.Enabled == true) {
    let welcomeChannel = await member.guild.channels.cache.get(welcomeSettings?.WelcomeChannelId ?? "000") || null;
    if (welcomeChannel) {
      if (welcomeSettings.WelcomeEmbed.EmbedAuthor || welcomeSettings.WelcomeEmbed.EmbedTitle || welcomeSettings.WelcomeEmbed.EmbedDescription || welcomeSettings.WelcomeEmbed.EmbedFooter || welcomeSettings.WelcomeEmbed.EmbedThumbnailImageUrl || welcomeSettings.WelcomeEmbed.EmbedImageUrl) {
        let embed = new moduleHolder.Modules.discord.EmbedBuilder()
        if (validator.StringIsValid(welcomeSettings.WelcomeEmbed.EmbedAuthor)) embed.setAuthor({ name: `${validator.ReplaceStringTags(welcomeSettings.WelcomeEmbed.EmbedAuthor, member.guild, member)}`, iconURL: `${validator.ReplaceStringTags(welcomeSettings.WelcomeEmbed.EmbedAuthorImageUrl, member.guild, member)}` })
        if (validator.StringIsValid(welcomeSettings.WelcomeEmbed.EmbedTitle)) embed.setTitle(`${validator.ReplaceStringTags(welcomeSettings.WelcomeEmbed.EmbedTitle, member.guild, member)}`)
        if (validator.StringIsValid(welcomeSettings.WelcomeEmbed.EmbedTitleUrl)) embed.setURL(`${validator.ReplaceStringTags(welcomeSettings.WelcomeEmbed.EmbedTitleUrl, member.guild, member)}`)
        if (validator.StringIsValid(welcomeSettings.WelcomeEmbed.EmbedDescription)) embed.setDescription(`${validator.ReplaceStringTags(welcomeSettings.WelcomeEmbed.EmbedDescription, member.guild, member)}`)
        if (validator.StringIsValid(welcomeSettings.WelcomeEmbed.EmbedThumbnailImageUrl)) embed.setThumbnail(`${validator.ReplaceStringTags(welcomeSettings.WelcomeEmbed.EmbedThumbnailImageUrl, member.guild, member)}`)
        if (validator.StringIsValid(welcomeSettings.WelcomeEmbed.EmbedImageUrl)) embed.setImage(`${validator.ReplaceStringTags(welcomeSettings.WelcomeEmbed.EmbedImageUrl, member.guild, member)}`)
        embed.setColor(moduleHolder.Modules.discord.Colors.Blue)
        if (validator.StringIsValid(welcomeSettings.WelcomeEmbed.EmbedFooter) && validator.StringIsValid(welcomeSettings.WelcomeEmbed.EmbedFooterImageUrl))
          embed.setFooter({ text: `${validator.ReplaceStringTags(welcomeSettings.WelcomeEmbed.EmbedFooter, member.guild, member)}`, iconURL: `${validator.ReplaceStringTags(welcomeSettings.WelcomeEmbed.EmbedFooterImageUrl, member.guild, member)}` })
        else
          if (validator.StringIsValid(welcomeSettings.WelcomeEmbed.EmbedFooter)) embed.setFooter({ text: `${validator.ReplaceStringTags(welcomeSettings.WelcomeEmbed.EmbedFooter, member.guild, member)}` })
        welcomeChannel?.send({ content: validator.StringIsValid(welcomeSettings.WelcomeEmbed.MessageContent) ? validator.ReplaceStringTags(welcomeSettings.WelcomeEmbed.MessageContent, member.guild, member) : null, embeds: [embed] }).catch(err => { console.log(`Error -> ${err}`) })
      } else if (validator.StringIsValid(welcomeSettings.WelcomeEmbed.MessageContent)) {
        welcomeChannel?.send({ content: validator.ReplaceStringTags(welcomeSettings.WelcomeEmbed.MessageContent, member.guild, member) }).catch(err => console.log(`Error -> ${err}`))
      }
    }
  }


  //Invite System
  let inviteSettings = await bot.inviteServices.GetAsync(member.guild?.id ?? null) || new InviteModel(member.guild.id);
  if (inviteSettings && inviteSettings.Enabled == true) {
    let inviteLogChannel = member.guild.channels.cache.get(inviteSettings?.ChannelId ?? "000") || null;
    let dbGuildInvites = await bot.inviteServices.GetGuildInvitesAsync(member.guild.id) || { GuildId: member.guild.id, Invites: [] }
    member.guild.invites.fetch().then(async guildInvites => {
      let invite = guildInvites.find(inv => dbGuildInvites.JoinInvites?.find(idb => idb.Uses < inv.uses && idb.Code === inv.code))
      if (invite) {
        bot.inviteServices.LoadGuildInvited(bot, member.guild);
        const inviter = await bot.users.cache.get(invite.inviter.id) || null
        if (!inviter) return;
        const MemberInvites = await bot.inviteServices.GetMemberInvitesAsync(member.guild.id, inviter.id) || new MemberInvitesModel(member.guild.id, inviter.id);
        if (!MemberInvites.InvitedUserIds.filter(id => id == member.id).some(x => x)) MemberInvites.InvitedUserIds.push(member.id)
        MemberInvites.Joins++
        MemberInvites.Stays++
        if (invite.inviter.id === member.id || member.user.createdTimestamp > Date.now() - 180000) MemberInvites.Fakes++
        const saved = await bot.inviteServices.SetMemberInvitesAsync(MemberInvites);
        if (saved && saved.acknowledged) {
          let inviterTag = inviter ? inviter.tag || 'Anonymous' : 'Anonymous';
          let inviterAvatar = inviter && inviter.avatar ? inviter.displayAvatarURL({ dynamic: true }) : 'https://i.imgur.com/YZ4IplN.png';
          const embed = new moduleHolder.Modules.discord.EmbedBuilder()
            .setColor(moduleHolder.Modules.discord.Colors.Blue)
            .setAuthor({ name: `${member.user.tag} joined!`, iconURL: member.user.displayAvatarURL({ dynamic: true }) })
            .setDescription(`${moduleHolder.Modules.emojie.invitesystem} **Joins:** \`${MemberInvites.Joins}\` - ${moduleHolder.Modules.emojie.userminus} **Leaves:** \`${MemberInvites.Leaves}\` - ${moduleHolder.Modules.emojie.userx} **Fake:** \`${MemberInvites.Fakes}\` - ${moduleHolder.Modules.emojie.verifycation} **Stays:** \`${MemberInvites.Stays}\``)
            .setFooter({ text: `Invited by ${inviterTag} | Code: ${invite.code}`, iconURL: inviterAvatar })
          return inviteLogChannel?.send({ embeds: [embed] }).catch(err => console.error);
        }
      } else {
        const embed = new moduleHolder.Modules.discord.EmbedBuilder()
        embed.setColor(moduleHolder.Modules.discord.Colors.Blue)
        embed.setAuthor({ name: `${member.user.tag} joined!`, iconURL: member.user.displayAvatarURL({ dynamic: true }) })
        if (member.guild.vanityURLCode) {
          embed.setDescription(`${member.user.tag} joined using Vanity code`)
          embed.setFooter({ text: `Invited by Anonymous | Code: ${member.guild.vanityURLCode}`, iconURL: 'https://i.imgur.com/YZ4IplN.png' })
        } else {
          embed.setDescription(`Could not trace who invited ${member.user.tag}`)
          embed.setFooter({ text: `Invited by Anonymous | Code: unknown`, iconURL: 'https://i.imgur.com/YZ4IplN.png' })
        }
        return inviteLogChannel?.send({ embeds: [embed] }).catch(err => console.error);
      }
    })
  }


}
