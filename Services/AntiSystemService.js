const AntiSystemModel = require("../Models/AntiSystemModel");
const MongoDB = require("../Classes/MongoDB");
module.exports = class AntiSystemService {
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
    return await this.MongoDb.GetOneAsync("AtomBot", "AntiSystem", { GuildId: guildId })
  }

  /**
 * @param {AntiSystemModel} AntiSystemModel
 */
  async SetAsync(AntiSystemModel) {
    if (!AntiSystemModel.GuildId) { return console.log(`guildId not defined -> ${AntiSystemModel.GuildId}`) }
    var fetchedData = await this.GetAsync(AntiSystemModel.GuildId) || null;
    if (!fetchedData) {
      return this.MongoDb.AddOneAsync("AtomBot", "AntiSystem", AntiSystemModel);
    } else {
      return this.MongoDb.UpdateOneAsync("AtomBot", "AntiSystem", fetchedData, AntiSystemModel);
    }
  }




}
