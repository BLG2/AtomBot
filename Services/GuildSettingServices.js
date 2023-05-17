const MongoDB = require("../Classes/MongoDB");
const WelcomeLeaveModel = require("../Models/WelcomeLeaveModel");
module.exports = class GuildSettingServices {
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
  async GetWelcomeLeaveAsync(guildId) {
    if (!guildId) { return console.log(`guildId not defined -> ${guildId}`) }
    return await this.MongoDb.GetOneAsync("AtomBot", "WelcomeLeave", { GuildId: guildId })
  }

  /**
 * @param {WelcomeLeaveModel} welcomeLeaveModel
 */
  async SetWelcomeLeaveAsync(welcomeLeaveModel) {
    if (!welcomeLeaveModel.GuildId) { return console.log(`guildId not defined -> ${welcomeLeaveModel.GuildId}`) }
    var fetchedData = await this.GetWelcomeLeaveAsync(welcomeLeaveModel.GuildId) || null;
    if (!fetchedData) {
      return this.MongoDb.AddOneAsync("AtomBot", "WelcomeLeave", welcomeLeaveModel);
    } else {
      return this.MongoDb.UpdateOneAsync("AtomBot", "WelcomeLeave", fetchedData, welcomeLeaveModel);
    }
  }




}
