const MongoDB = require("../Classes/MongoDB");
const GuildInviteModel = require("../Models/GuildInviteModel");
const InviteModel = require("../Models/InviteModel");
const MemberInvitesModel = require("../Models/MemberInvitesModel");
module.exports = class InviteService {
  MongoDb;
  /**
 * @param {MongoDB} mongoDb
 */
  constructor(mongoDb) {
    this.MongoDb = mongoDb;
  }

  // Invite system

  /**
 * @param {String} guildId
 */
  async GetAsync(guildId) {
    if (!guildId) { return console.log(`guildId not defined -> ${guildId}`) }
    return this.MongoDb.GetOneAsync("AtomBot", "Invite", { GuildId: guildId })
  }

  /**
 * @param {InviteModel} inviteModel
 */
  async SetAsync(inviteModel) {
    if (!inviteModel.GuildId) { return console.log(`guildId not defined -> ${inviteModel.GuildId}`) }
    var fetchedData = await this.GetAsync(inviteModel.GuildId) || null;
    if (!fetchedData) {
      return this.MongoDb.AddOneAsync("AtomBot", "Invite", inviteModel);
    } else {
      return this.MongoDb.UpdateOneAsync("AtomBot", "Invite", fetchedData, inviteModel);
    }
  }

  // Member invites
  /**
 * @param {String} guildId
 * @param {String} memberId
 */
  async GetInvitedMemberFromAllMemberInvitesAsync(guildId, memberId) {
    if (!guildId) { return console.log(`guildId not defined -> ${guildId}`) }
    if (!memberId) { return console.log(`guildId not defined -> ${memberId}`) }
    let fetchedData = await this.MongoDb.GetAllAsync("AtomBot", "MemberInvites") || null;
    if (fetchedData && fetchedData.length > 0) {
      return await fetchedData.filter(item => item.GuildId == guildId && item.InvitedUserIds.filter(id => id == memberId).some(id => id));
    }
    return [];
  }

  /**
 * @param {String} guildId
 * @param {String} memberId
 */
  async GetMemberInvitesAsync(guildId, memberId) {
    if (!guildId) { return console.log(`guildId not defined -> ${guildId}`) }
    if (!memberId) { return console.log(`guildId not defined -> ${memberId}`) }
    return this.MongoDb.GetOneAsync("AtomBot", "MemberInvites", { GuildId: guildId, MemberId: memberId })
  }

  /**
 * @param {MemberInvitesModel} memberInvitesModel
 */
  async SetMemberInvitesAsync(memberInvitesModel) {
    if (!memberInvitesModel.GuildId) { return console.log(`guildId not defined -> ${memberInvitesModel.GuildId}`) }
    if (!memberInvitesModel.MemberId) { return console.log(`guildId not defined -> ${memberInvitesModel.MemberId}`) }
    var fetchedData = await this.GetMemberInvitesAsync(memberInvitesModel.GuildId, memberInvitesModel.MemberId) || null;
    if (!fetchedData) {
      return this.MongoDb.AddOneAsync("AtomBot", "MemberInvites", memberInvitesModel);
    } else {
      return this.MongoDb.UpdateOneAsync("AtomBot", "MemberInvites", fetchedData, memberInvitesModel);
    }
  }

  /**
 * @param {MemberInvitesModel} memberInvitesModel
 */
  async RemoveMemberInvitesAsync(memberInvitesModel) {
    if (!memberInvitesModel.GuildId) { return console.log(`guildId not defined -> ${memberInvitesModel.GuildId}`) }
    if (!memberInvitesModel.MemberId) { return console.log(`guildId not defined -> ${memberInvitesModel.MemberId}`) }
    var fetchedData = await this.GetMemberInvitesAsync(memberInvitesModel.GuildId, memberInvitesModel.MemberId) || null;
    if (fetchedData) {
      return this.MongoDb.RemoveOneAsync("AtomBot", "MemberInvites", fetchedData);
    }
    return null;
  }

  /**
 * @param {String} guildId
 */
  async ResetAllMemberInvitesAsync(guildId) {
    if (!guildId) { return console.log(`guildId not defined -> ${guildId}`) }
    return this.MongoDb.RemoveAllAsync("AtomBot", "MemberInvites", guildId);
  }







  /**
 * @param {String} guildId
 * @param {String} memberId
 */
  async GetGuildInvitesAsync(guildId) {
    if (!guildId) { return console.log(`guildId not defined -> ${guildId}`) }
    return this.MongoDb.GetOneAsync("AtomBot", "GuildInvites", { GuildId: guildId })
  }

  /**
 * @param {String} guildId
 * @param {Array<GuildInviteModel>} guildJoinInviteModelArray
 * @param {Array<GuildInviteModel>} guildLeaveInviteModelArray
 */
  async SetGuildInvitesAsync(guildId, guildJoinInviteModelArray, guildLeaveInviteModelArray) {
    if (!guildId) { return console.log(`guildId not defined -> ${guildId}`) }
    if (guildJoinInviteModelArray.length <= 0) { guildJoinInviteModelArray = []; }
    if (guildJoinInviteModelArray.length <= 0) { guildLeaveInviteModelArray = []; }
    var fetchedData = await this.GetGuildInvitesAsync(guildId) || null;
    if (!fetchedData) {
      return this.MongoDb.AddOneAsync("AtomBot", "GuildInvites", { GuildId: guildId, JoinInvites: guildJoinInviteModelArray, LeaveInvites: guildLeaveInviteModelArray });
    } else {
      return this.MongoDb.UpdateOneAsync("AtomBot", "GuildInvites", fetchedData, { GuildId: guildId, JoinInvites: guildJoinInviteModelArray, LeaveInvites: guildLeaveInviteModelArray });
    }
  }


  /**
 * @param {String} guildId
 */
  async ResetGuildInvitesAsync(guildId) {
    if (!guildId) { return console.log(`guildId not defined -> ${guildId}`) }
    return this.MongoDb.RemoveAllAsync("AtomBot", "GuildInvites", guildId);
  }


  LoadGuildInvited(bot, guild = null) {
    try {
      if (guild) {
        guild.invites.fetch().then(async invites => {
          let guildInviteModelArray = [];
          await bot.inviteServices.ResetGuildInvitesAsync(guild.id);
          await invites.forEach(async inv => {
            if (inv && inv.code && inv.inviter && inv.inviter.id) {
              guildInviteModelArray.push(new GuildInviteModel(inv.code, inv.inviter.id, inv.uses))
            }
          });
          await bot.inviteServices.SetGuildInvitesAsync(guild.id, guildInviteModelArray, guildInviteModelArray);
        }).catch(err => console.err);
      } else {
        bot.guilds.cache.map(async guild => {
          guild.invites.fetch().then(async invites => {
            let guildInviteModelArray = [];
            await bot.inviteServices.ResetGuildInvitesAsync(guild.id);
            await invites.forEach(async inv => {
              if (inv && inv.code && inv.inviter && inv.inviter.id) {
                guildInviteModelArray.push(new GuildInviteModel(inv.code, inv.inviter.id, inv.uses))
              }
            });
            await bot.inviteServices.SetGuildInvitesAsync(guild.id, guildInviteModelArray, guildInviteModelArray);
          }).catch(err => console.err);
        })
      }
    } catch (e) { }

  }









}
