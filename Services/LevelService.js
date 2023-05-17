const MongoDB = require("../Classes/MongoDB");
const LevelModel = require("../Models/LevelModel");
const MemberLevelModel = require("../Models/MemberLevelModel");
module.exports = class LevelService {
  MongoDb;
  /**
 * @param {MongoDB} mongoDb
 */
  constructor(mongoDb) {
    this.MongoDb = mongoDb;
  }

  // Level system

  /**
 * @param {String} guildId
 */
  async GetAsync(guildId) {
    if (!guildId) { return console.log(`guildId not defined -> ${guildId}`) }
    return this.MongoDb.GetOneAsync("AtomBot", "Level", { GuildId: guildId })
  }

  /**
 * @param {LevelModel} levelModel
 */
  async SetAsync(levelModel) {
    if (!levelModel.GuildId) { return console.log(`guildId not defined -> ${levelModel.GuildId}`) }
    var fetchedData = await this.GetAsync(levelModel.GuildId) || null;
    if (!fetchedData) {
      return this.MongoDb.AddOneAsync("AtomBot", "Level", levelModel);
    } else {
      return this.MongoDb.UpdateOneAsync("AtomBot", "Level", fetchedData, levelModel);
    }
  }

  // Member levels

  /**
 * @param {String} guildId
 * @param {String} memberId
 */
  async GetMemberLevelAsync(guildId, memberId) {
    if (!guildId) { return console.log(`guildId not defined -> ${guildId}`) }
    if (!memberId) { return console.log(`guildId not defined -> ${memberId}`) }
    return this.MongoDb.GetOneAsync("AtomBot", "MemberLevel", { GuildId: guildId, MemberId: memberId })
  }

  /**
 * @param {MemberLevelModel} memberLevelModel
 */
  async SetMemberLevelAsync(memberLevelModel) {
    if (!memberLevelModel.GuildId) { return console.log(`guildId not defined -> ${memberLevelModel.GuildId}`) }
    if (!memberLevelModel.MemberId) { return console.log(`guildId not defined -> ${memberLevelModel.MemberId}`) }
    var fetchedData = await this.GetMemberLevelAsync(memberLevelModel.GuildId, memberLevelModel.MemberId) || null;
    if (!fetchedData) {
      return this.MongoDb.AddOneAsync("AtomBot", "MemberLevel", memberLevelModel);
    } else {
      return this.MongoDb.UpdateOneAsync("AtomBot", "MemberLevel", fetchedData, memberLevelModel);
    }
  }

  /**
 * @param {MemberLevelModel} memberLevelModel
 */
  async RemoveMemberLevelAsync(memberLevelModel) {
    if (!memberLevelModel.GuildId) { return console.log(`guildId not defined -> ${memberLevelModel.GuildId}`) }
    if (!memberLevelModel.MemberId) { return console.log(`guildId not defined -> ${memberLevelModel.MemberId}`) }
    var fetchedData = await this.GetMemberLevelAsync(memberLevelModel.GuildId, memberLevelModel.MemberId) || null;
    if (fetchedData) {
      return this.MongoDb.RemoveOneAsync("AtomBot", "MemberLevel", fetchedData);
    }
    return null;
  }

  /**
 * @param {String} guildId
 */
  async ResetAllMemberLevelAsync(guildId) {
    if (!guildId) { return console.log(`guildId not defined -> ${guildId}`) }
    return this.MongoDb.RemoveAllAsync("AtomBot", "MemberLevel", guildId);
  }



}
