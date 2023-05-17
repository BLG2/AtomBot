const MongoDB = require("../Classes/MongoDB");
const ServerStatsModel = require("../Models/ServerStatsModel");
module.exports = class ServerStatsService {
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
    return this.MongoDb.GetOneAsync("AtomBot", "ServerStats", { GuildId: guildId })
  }
  /**
 * @param {ServerStatsModel} serverStatsModel
 */
  async SetAsync(serverStatsModel) {
    if (!serverStatsModel.GuildId) { return console.log(`guildId not defined -> ${serverStatsModel.GuildId}`) }
    var fetchedData = await this.GetAsync(serverStatsModel.GuildId) || null;
    if (!fetchedData) {
      return this.MongoDb.AddOneAsync("AtomBot", "ServerStats", serverStatsModel);
    } else {
      return this.MongoDb.UpdateOneAsync("AtomBot", "ServerStats", fetchedData, serverStatsModel);
    }

  }
}
