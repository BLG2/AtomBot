const ModuleHolder = require("../Classes/ModuleHolder");
const MemberInvitesModel = require("../Models/MemberInvitesModel");
const InviteModel = require("../Models/InviteModel");
const ValidatorHelperService = require("../Services/ValidatorHelperService");
const WelcomeLeaveModel = require("../Models/WelcomeLeaveModel");
const validator = new ValidatorHelperService();

const moduleHolder = new ModuleHolder();
module.exports = async (bot, member) => {
  if (!member || !member.guild) return;

  //Invite System
  let inviteSettings = await bot.inviteServices.GetAsync(member.guild?.id ?? null) || new InviteModel(member.guild.id);
  if (inviteSettings && inviteSettings.Enabled == true) {
    let inviteLogChannel = await member.guild.channels.cache.get(inviteSettings?.ChannelId ?? "000") || null;
    let dbInviter = await bot.inviteServices.GetInvitedMemberFromAllMemberInvitesAsync(member.guild.id, member.id);
    if (dbInviter && dbInviter.length > 0) {
      bot.inviteServices.LoadGuildInvited(bot, member.guild);
      dbInviter.map(async MemberInvites => {
        const inviter = await bot.users.cache.get(MemberInvites.MemberId) || null
        if (!inviter) return;
        if (!MemberInvites.InvitedUserIds.filter(id => id == member.id).some(x => x)) MemberInvites.InvitedUserIds.push(member.id)
        MemberInvites.Leaves++
        if ((Number(MemberInvites.Stays) - 1) >= 0) MemberInvites.Stays--
        if (MemberInvites.MemberId === member.id && (Number(MemberInvites.Fakes) - 1) >= 0) MemberInvites.Fakes--
        MemberInvites.InvitedUserIds = MemberInvites.InvitedUserIds.filter(id => id != member.id);
        const saved = await bot.inviteServices.SetMemberInvitesAsync(MemberInvites);
        if (saved && saved.acknowledged) {
          let inviterTag = inviter ? inviter.tag || 'Anonymous' : 'Anonymous';
          let inviterAvatar = inviter && inviter.avatar ? inviter.displayAvatarURL({ dynamic: true }) : 'https://i.imgur.com/YZ4IplN.png';
          const embed = new moduleHolder.Modules.discord.EmbedBuilder()
            .setColor(moduleHolder.Modules.discord.Colors.Blue)
            .setAuthor({ name: `${member.user.tag} left!`, iconURL: member.user.displayAvatarURL({ dynamic: true }) })
            .setDescription(`${moduleHolder.Modules.emojie.invitesystem} **Joins:** \`${MemberInvites.Joins}\` - ${moduleHolder.Modules.emojie.userminus} **Leaves:** \`${MemberInvites.Leaves}\` - ${moduleHolder.Modules.emojie.userx} **Fake:** \`${MemberInvites.Fakes}\` - ${moduleHolder.Modules.emojie.verifycation} **Stays:** \`${MemberInvites.Stays}\``)
            .setFooter({ text: `Invited by ${inviterTag}`, iconURL: inviterAvatar })
          return inviteLogChannel?.send({ embeds: [embed] }).catch(err => console.error);
        }
      })
    } else {
      const embed = new moduleHolder.Modules.discord.EmbedBuilder()
        .setColor(moduleHolder.Modules.discord.Colors.Blue)
        .setAuthor({ name: `${member.user.tag} left!`, iconURL: member.user.displayAvatarURL({ dynamic: true }) })
        .setDescription(`Could not trace who invited ${member.user.tag}`)
        .setFooter({ text: `Invited by Anonymous | Code: unknown`, iconURL: 'https://i.imgur.com/YZ4IplN.png' })
      return inviteLogChannel?.send({ embeds: [embed] }).catch(err => console.error);
    }
  }



  //Leave Messages
  const leaveSettings = await bot.guildSettingsServices.GetWelcomeLeaveAsync(member.guild.id) || new WelcomeLeaveModel(member.guild.id);
  if (leaveSettings && leaveSettings.Enabled == true) {
    let leaveChannel = await member.guild.channels.cache.get(leaveSettings?.LeaveChannelId ?? "000") || null;
    if (leaveChannel) {
      if (leaveSettings.LeaveEmbed.EmbedAuthor || leaveSettings.LeaveEmbed.EmbedTitle || leaveSettings.LeaveEmbed.EmbedDescription || leaveSettings.LeaveEmbed.EmbedFooter || leaveSettings.LeaveEmbed.EmbedThumbnailImageUrl || leaveSettings.LeaveEmbed.EmbedImageUrl) {
        let embed = new moduleHolder.Modules.discord.EmbedBuilder()
        if (validator.StringIsValid(leaveSettings.LeaveEmbed.EmbedAuthor)) embed.setAuthor({ name: `${validator.ReplaceStringTags(leaveSettings.LeaveEmbed.EmbedAuthor, member.guild, member)}`, iconURL: `${validator.ReplaceStringTags(leaveSettings.LeaveEmbed.EmbedAuthorImageUrl, member.guild, member)}` })
        if (validator.StringIsValid(leaveSettings.LeaveEmbed.EmbedTitle)) embed.setTitle(`${validator.ReplaceStringTags(leaveSettings.LeaveEmbed.EmbedTitle, member.guild, member)}`)
        if (validator.StringIsValid(leaveSettings.LeaveEmbed.EmbedTitleUrl)) embed.setURL(`${validator.ReplaceStringTags(leaveSettings.LeaveEmbed.EmbedTitleUrl, member.guild, member)}`)
        if (validator.StringIsValid(leaveSettings.LeaveEmbed.EmbedDescription)) embed.setDescription(`${validator.ReplaceStringTags(leaveSettings.LeaveEmbed.EmbedDescription, member.guild, member)}`)
        if (validator.StringIsValid(leaveSettings.LeaveEmbed.EmbedThumbnailImageUrl)) embed.setThumbnail(`${validator.ReplaceStringTags(leaveSettings.LeaveEmbed.EmbedThumbnailImageUrl, member.guild, member)}`)
        if (validator.StringIsValid(leaveSettings.LeaveEmbed.EmbedImageUrl)) embed.setImage(`${validator.ReplaceStringTags(leaveSettings.LeaveEmbed.EmbedImageUrl, member.guild, member)}`)
        embed.setColor(moduleHolder.Modules.discord.Colors.Blue)
        if (validator.StringIsValid(leaveSettings.WelcomeEmbed.EmbedFooter) && validator.StringIsValid(leaveSettings.WelcomeEmbed.EmbedFooterImageUrl))
          embed.setFooter({ text: `${validator.ReplaceStringTags(leaveSettings.WelcomeEmbed.EmbedFooter, member.guild, member)}`, iconURL: `${validator.ReplaceStringTags(leaveSettings.WelcomeEmbed.EmbedFooterImageUrl, member.guild, member)}` })
        else
          if (validator.StringIsValid(leaveSettings.WelcomeEmbed.EmbedFooter)) embed.setFooter({ text: `${validator.ReplaceStringTags(leaveSettings.WelcomeEmbed.EmbedFooter, member.guild, member)}` })
        leaveChannel?.send({ content: validator.StringIsValid(leaveSettings.LeaveEmbed.MessageContent) ? validator.ReplaceStringTags(leaveSettings.LeaveEmbed.MessageContent, member.guild, member) : null, embeds: [embed] }).catch(err => { })
      } else if (validator.StringIsValid(leaveSettings.LeaveEmbed.MessageContent)) {
        leaveChannel?.send({ content: validator.ReplaceStringTags(leaveSettings.LeaveEmbed.MessageContent, member.guild, member) }).catch(err => console.log(`Error -> ${err}`))
      }
    }
  }

}
