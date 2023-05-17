const MongoDB = require("../Classes/MongoDB");
const GiveawayModel = require("../Models/GiveawayModel");
module.exports = class GiveawayService {
  MongoDb;
  /**
 * @param {MongoDB} mongoDb
 */
  constructor(mongoDb) {
    this.MongoDb = mongoDb;
  }

  /**
 * @param {String} guildId
 */
  async GetAsync(guildId, messageId) {
    if (!guildId) { return console.log(`guildId not defined -> ${guildId}`) }
    if (messageId)
      return this.MongoDb.GetOneAsync("AtomBot", "Giveaway", { GuildId: guildId, MessageId: messageId })
    else
      return this.MongoDb.GetOneAsync("AtomBot", "Giveaway", { GuildId: guildId })
  }


  /**
 * @param {String} guildId
 */
  async GetAllAsync(guildId) {
    if (!guildId) { return console.log(`guildId not defined -> ${guildId}`) }
    let allItems = await this.MongoDb.GetAllAsync("AtomBot", "Giveaway");
    return allItems && allItems.length > 0 ? allItems.filter(item => item.GuildId == guildId && item.Ended == false) : [];
  }


  /**
 * @param {GiveawayModel} giveawayModel
 */
  async SetAsync(giveawayModel) {
    if (!giveawayModel.GuildId) { return console.log(`guildId not defined -> ${giveawayModel.GuildId}`) }
    return this.MongoDb.AddOneAsync("AtomBot", "Giveaway", giveawayModel);
  }


  /**
 * @param {GiveawayModel} giveawayModel
 */
  async UpdateAsync(giveawayModel) {
    if (!giveawayModel.GuildId) { return console.log(`guildId not defined -> ${giveawayModel.GuildId}`) }
    if (!giveawayModel.MessageId) { return console.log(`messageId not defined -> ${giveawayModel.MessageId}`) }
    var fetchedData = await this.GetAsync(giveawayModel.GuildId, giveawayModel.MessageId) || null;
    if (fetchedData) {
      return this.MongoDb.UpdateOneAsync("AtomBot", "Giveaway", fetchedData, giveawayModel);
    }
    return null;
  }


  /**
 * @param {GiveawayModel} giveawayModel
 */
  async RemoveAsync(giveawayModel) {
    if (!giveawayModel.GuildId) { return console.log(`guildId not defined -> ${giveawayModel.GuildId}`) }
    var fetchedData = await this.GetAsync(giveawayModel.GuildId) || null;
    if (fetchedData) {
      return this.MongoDb.RemoveOneAsync("AtomBot", "Giveaway", fetchedData);
    }
    return null;
  }



}
