const MongoDB = require("../Classes/MongoDB");
const GuessTheNumberModel = require("../Models/GuessTheNumberModel");
module.exports = class GuessTheNumberService {
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
  async GetAsync(guildId) {
    if (!guildId) { return console.log(`guildId not defined -> ${guildId}`) }
    return this.MongoDb.GetOneAsync("AtomBot", "GuessTheNumber", { GuildId: guildId })
  }

  /**
 * @param {GuessTheNumberModel} guessTheNumberModel
 */
  async SetAsync(guessTheNumberModel) {
    if (!guessTheNumberModel.GuildId) { return console.log(`guildId not defined -> ${guessTheNumberModel.GuildId}`) }
    if (!guessTheNumberModel.ChannelId) { return console.log(`channelId not defined -> ${guessTheNumberModel.ChannelId}`) }
    var fetchedData = await this.GetAsync(guessTheNumberModel.GuildId) || null;
    if (!fetchedData) {
      return this.MongoDb.AddOneAsync("AtomBot", "GuessTheNumber", guessTheNumberModel);
    } else {
      return this.MongoDb.UpdateOneAsync("AtomBot", "GuessTheNumber", fetchedData, guessTheNumberModel);
    }
  }


  /**
 * @param {GuessTheNumberModel} guessTheNumberModel
 */
  async RemoveAsync(guessTheNumberModel) {
    if (!guessTheNumberModel.GuildId) { return console.log(`guildId not defined -> ${guessTheNumberModel.GuildId}`) }
    var fetchedData = await this.GetAsync(guessTheNumberModel.GuildId) || null;
    if (fetchedData) {
      return this.MongoDb.RemoveOneAsync("AtomBot", "GuessTheNumber", fetchedData);
    }
    return null;
  }








}
