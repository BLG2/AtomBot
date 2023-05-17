const SelfRoleModel = require("../../Models/SelfRoleModel")
const ModuleHolder = require("../../Classes/ModuleHolder")

const moduleHolder = new ModuleHolder();
module.exports = {
  help: {
    name: "channel",
    aliases: [],
    description: `Set the channel to send the selfrole message.`,
    examples: [`channel <#channel>`],
    permissions: 'ManageChannels',
    permissionsMe: ['none'],
    ownerOnly: false,
    file: __filename,
    arguments: [
      { name: 'channel', description: 'Channel to add or remove.', required: true },
    ]
  },
  async run(bot, message, args) {
    let channel = await message.options.getChannel("channel") || null;
    const currentSettings = await bot.selfRoleServices.GetAsync(message.guild.id) || new SelfRoleModel(message.guild.id);

    currentSettings.ChannelId = channel.id;
    const saved = await bot.selfRoleServices.SetAsync(currentSettings);
    switch (saved?.acknowledged ?? false) {
      case true:
        let onembed = new moduleHolder.Modules.discord.EmbedBuilder()
          .setDescription(`Succesfully set selfrole channel to ${channel}!`)
          .setColor(moduleHolder.Modules.discord.Colors.Blue)
          .setFooter({ text: `${moduleHolder.Modules.private.embedFooter}`, iconURL: `${bot.user.displayAvatarURL({ extension: 'png' })}` })
        message.followUp({ embeds: [onembed] }).catch(err => console.err);
        SendMessage(currentSettings);
        break;
      case false:
        let errorEmbed = new moduleHolder.Modules.discord.EmbedBuilder()
          .setDescription(`${moduleHolder.Modules.emojie.error} Somthing went whrong.`)
          .setColor(moduleHolder.Modules.discord.Colors.Red)
          .setFooter({ text: `${moduleHolder.Modules.private.embedFooter}`, iconURL: `${bot.user.displayAvatarURL({ extension: 'png' })}` })
        message.followUp({ embeds: [errorEmbed] }).catch(err => console.err);
        break;
    }



    async function SendMessage(currentSettings) {
      let selectors = []
      if (currentSettings && currentSettings.Enabled == true && currentSettings.RoleIds.length > 0) {

        for (let i = 0; i < 5; i++) {
          selectors[i] = new moduleHolder.Modules.discord.StringSelectMenuBuilder()
            .setCustomId(`SelfroleMenu_${message.guild.id}_${i}`)
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
          // let emojieformenu = await bot.emojis.cache.find(emj => emj.name.toLowerCase() === data.emoji) || bot.emojis.cache.find(emj => emj.id === data.emoji) || bot.emojis.cache.find(emj => `<${emj.identifier}>` === data.emoji) || bot.emojis.cache.find(emj => `<:${emj.identifier}>` === data.emoji) || data.emoji || null
          let menuRole = await message.guild.roles.cache.find(rol => rol.id === data) || null;
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
          .setAuthor({ name: "Selfrole Menu", iconURL: bot.user.displayAvatarURL() })
          .setDescription("***Select the role you need in the `Selection` down Below!***")

        let btn = new moduleHolder.Modules.discord.ButtonBuilder()
          .setCustomId(`remove_all_roles_${message.guild.id}`)
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


};
