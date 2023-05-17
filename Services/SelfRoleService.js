const ModuleHolder = require("../Classes/ModuleHolder");
const MongoDB = require("../Classes/MongoDB");
const SelfRoleModel = require("../Models/SelfRoleModel");
const moduleHolder = new ModuleHolder();
module.exports = class SelfRoleService {
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
    return this.MongoDb.GetOneAsync("AtomBot", "SelfRole", { GuildId: guildId })
  }

  /**
 * @param {SelfRoleModel} selfRoleModel
 */
  async SetAsync(selfRoleModel) {
    if (!selfRoleModel.GuildId) { return console.log(`guildId not defined -> ${selfRoleModel.GuildId}`) }
    if (!selfRoleModel.ChannelId) { return console.log(`channelId not defined -> ${selfRoleModel.ChannelId}`) }
    var fetchedData = await this.GetAsync(selfRoleModel.GuildId) || null;
    if (!fetchedData) {
      return this.MongoDb.AddOneAsync("AtomBot", "SelfRole", selfRoleModel);
    } else {
      return this.MongoDb.UpdateOneAsync("AtomBot", "SelfRole", fetchedData, selfRoleModel);
    }

  }


  /**
 * @param {Guild} guild
 */
  async SendMessageAsync(guild) {
    let currentSettings = await this.GetAsync(guild.id) || null;
    if (!currentSettings) return;
    const channel = guild.channels.cache.get(currentSettings?.ChannelId ?? "000") || null;
    let selectors = []
    if (channel && currentSettings && currentSettings.Enabled == true && currentSettings.RoleIds.length > 0) {

      for (let i = 0; i < 5; i++) {
        selectors[i] = new moduleHolder.Modules.discord.StringSelectMenuBuilder()
          .setCustomId(`SelfroleMenu_${guild.id}_${i}`)
          .setMaxValues(1)
          .setMinValues(0)
          .setPlaceholder('Select your role here!');
        selectors[i].addOptions({
          "label": `EmptySlot`,
          "value": `EmptySlot`,
        })
      }
      let currentSelector = selectors[0]
      let selectorNr = 0

      await currentSettings.RoleIds.map(async data => {
        let menuRole = await guild.roles.cache.find(rol => rol.id === data) || null;
        if (menuRole) {
          if (currentSelector.options.length >= 24) {
            selectorNr++
            currentSelector = selectors[selectorNr]
          }
          currentSelector.addOptions({
            "label": `${menuRole.name}`,
            "value": `${menuRole.id}`,
            "description": `Gain the role ${menuRole.name}.`,
            // "emoji": emojieformenu
          })
        }
      })

      let MenuEmbed = new moduleHolder.Modules.discord.EmbedBuilder()
        .setColor(moduleHolder.Modules.discord.Colors.Blue)
        .setAuthor({ name: "Selfrole Menu" })
        .setDescription("***Select the role you need in the `Selection` down Below!***")

      let btn = new moduleHolder.Modules.discord.ButtonBuilder()
        .setCustomId(`remove_all_roles_${guild.id}`)
        .setLabel(`Remove all roles`)
        .setEmoji(`❌`)
        .setStyle(4)
      let ButtonsToAdd = new moduleHolder.Modules.discord.ActionRowBuilder()
        .addComponents(btn)

      let Components = [ButtonsToAdd]
      let selectorsToDisplay = await selectors.filter(s => s.options.length > 1)
      selectorsToDisplay.map(s => {
        Components.push({ "type": 1, "components": [s] })
      })

      channel.send({
        embeds: [MenuEmbed],
        "components": Components
      }).catch(e => { })
    }

  }


}
