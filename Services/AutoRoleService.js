const MongoDB = require("../Classes/MongoDB");
const AutoRoleModel = require("../Models/AutoRoleModel");
module.exports = class AutoRoleService {
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
    return this.MongoDb.GetOneAsync("AtomBot", "AutoRole", { GuildId: guildId })
  }

  /**
 * @param {AutoRoleModel} autoRoleModel
 */
  async SetAsync(autoRoleModel) {
    if (!autoRoleModel.GuildId) { return console.log(`guildId not defined -> ${autoRoleModel.GuildId}`) }
    var fetchedData = await this.GetAsync(autoRoleModel.GuildId) || null;
    if (!fetchedData) {
      return this.MongoDb.AddOneAsync("AtomBot", "AutoRole", autoRoleModel);
    } else {
      return this.MongoDb.UpdateOneAsync("AtomBot", "AutoRole", fetchedData, autoRoleModel);
    }
  }



}
