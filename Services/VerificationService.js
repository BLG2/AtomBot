const { Guild } = require("discord.js");
const ModuleHolder = require("../Classes/ModuleHolder");
const MongoDB = require("../Classes/MongoDB");
const VerificationModel = require("../Models/VerificationModel");
const moduleHolder = new ModuleHolder();
module.exports = class VerificationService {
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
    return this.MongoDb.GetOneAsync("AtomBot", "Verification", { GuildId: guildId })
  }



  /**
 * @param {VerificationModel} verificationModel
 */
  async SetAsync(verificationModel) {
    if (!verificationModel.GuildId) { return console.log(`guildId not defined -> ${verificationModel.GuildId}`) }
    if (!verificationModel.ChannelId) { return console.log(`channelId not defined -> ${verificationModel.ChannelId}`) }
    var fetchedData = await this.GetAsync(verificationModel.GuildId) || null;
    if (!fetchedData) {
      return this.MongoDb.AddOneAsync("AtomBot", "Verification", verificationModel);
    } else {
      return this.MongoDb.UpdateOneAsync("AtomBot", "Verification", fetchedData, verificationModel);
    }
  }


  /**
 * @param {VerificationModel} verificationModel
 */
  async RemoveAsync(verificationModel) {
    if (!verificationModel.GuildId) { return console.log(`guildId not defined -> ${verificationModel.GuildId}`) }
    var fetchedData = await this.GetAsync(verificationModel.GuildId) || null;
    if (fetchedData) {
      return this.MongoDb.RemoveOneAsync("AtomBot", "Verification", fetchedData);
    }
    return null;
  }


  /**
 * @param {Guild} guild
 */
  async SendMessageAsync(guild) {
    let currentSettings = await this.GetAsync(guild.id) || null;
    if (!currentSettings) return null;
    let verifyChannel = guild.channels.cache.get(currentSettings?.ChannelId ?? "000") || null;
    if (!verifyChannel) return null;
    let verificationMessage = await verifyChannel.messages.fetch(currentSettings?.MessageId ?? "000").catch(e => { }) || null
    const embed = new moduleHolder.Modules.discord.EmbedBuilder()
      .setDescription(`${currentSettings.VerifyMessage}`)
      .setColor(moduleHolder.Modules.discord.Colors.Blue)
      .setFooter({ text: `ReactionRole System` });
    let btn = new moduleHolder.Modules.discord.ButtonBuilder()
      .setCustomId(`verify_reactionrole_${guild.id}`)
      .setLabel(`Verify Here!`)
      .setEmoji(`✅`)
      .setStyle(3)
    let ButtonsToAdd = new moduleHolder.Modules.discord.ActionRowBuilder()
      .addComponents(btn)
    if (verificationMessage) {
      await verificationMessage.edit({
        embeds: [embed],
        "components": [ButtonsToAdd]
      }).catch(err => { })
    } else {
      await verifyChannel.send({
        embeds: [embed],
        "components": [ButtonsToAdd]
      }).then(async m => {
        currentSettings.MessageId = m.id
        await this.SetAsync(currentSettings);
      }).catch(err => { })
    }
  }





}
