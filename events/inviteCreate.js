const GuildInviteModel = require("../Models/GuildInviteModel");

module.exports = async (bot, invite) => {
  if (!invite || !invite.guild) return;
  // save guildInvites
  try {
    let guildInviteModelArray = await bot.inviteServices.GetGuildInvitesAsync(invite.guild.id) || { GuildId: invite.guild.id, Invites: [] }
    if (invite && invite.code && invite.inviter && invite.inviter.id) {
      guildInviteModelArray.JoinInvites.push(new GuildInviteModel(invite.code, invite.inviter.id, invite.uses));
      guildInviteModelArray.LeaveInvites.push(new GuildInviteModel(invite.code, invite.inviter.id, invite.uses));
    }
    await bot.inviteServices.SetGuildInvitesAsync(invite.guild.id, guildInviteModelArray.JoinInvites, guildInviteModelArray.LeaveInvites);
  } catch (e) { }

}
