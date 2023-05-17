const MongoDB = require("../Classes/MongoDB");
const MemberMessageCountModel = require("../Models/MemberMessageCountModel");
module.exports = class MemberMessageCountService {
  MongoDb;
  /**
 * @param {MongoDB} mongoDb
 */
  constructor(mongoDb) {
    this.MongoDb = mongoDb;
  }

  /**
 * @param {String} guildId
 * @param {String} memberId
 */
  async GetAsync(guildId, memberId) {
    if (!guildId) { return console.log(`guildId not defined -> ${guildId}`) }
    if (!memberId) { return console.log(`memberId not defined -> ${memberId}`) }
    return this.MongoDb.GetOneAsync("AtomBot", "MemberMessageCount", { GuildId: guildId, MemberId: memberId })
  }

  /**
 * @param {MemberMessageCountModel} memberMessageCountModel
 */
  async SetAsync(memberMessageCountModel) {
    if (!memberMessageCountModel.GuildId) { return console.log(`guildId not defined -> ${autoRoleModel.GuildId}`) }
    if (!memberMessageCountModel.MemberId) { return console.log(`memberId not defined -> ${memberMessageCountModel.MemberId}`) }
    var fetchedData = await this.GetAsync(memberMessageCountModel.GuildId, memberMessageCountModel.MemberId) || null;
    if (!fetchedData) {
      return this.MongoDb.AddOneAsync("AtomBot", "MemberMessageCount", memberMessageCountModel);
    } else {
      return this.MongoDb.UpdateOneAsync("AtomBot", "MemberMessageCount", fetchedData, memberMessageCountModel);
    }
  }



}
