const AntiSystemModel = require("../../Models/AntiSystemModel")
const ModuleHolder = require("../../Classes/ModuleHolder")

const moduleHolder = new ModuleHolder();
module.exports = {
  help: {
    name: "exclude",
    aliases: [],
    description: `Add or remove a channel or role from the anti exclude list.`,
    examples: [`exchannel <#channel/#category/@role>`],
    permissions: 'ManageMessages',
    permissionsMe: ['none'],
    ownerOnly: false,
    file: __filename,
    arguments: [
      { name: 'option_string', description: 'add or remove or list', required: true, options: ["add", "remove", "list"] },
      { name: 'channel', description: 'Channel/Categorie to add or remove.', required: false },
      { name: 'role', description: 'Role to add or remove.', required: false },
    ]
  },
  async run(bot, message, args) {

    let option = await message.options.getString("option_string");
    let channel = await message.options.getChannel("channel") || null;
    let role = await message.options.getRole("role") || null

    const currentSettings = await bot.antiSystemServices.GetAsync(message.guild.id) || new AntiSystemModel(message.guild.id);

    switch (option) {
      case "add":
        AddOrRemoveId(true)
        break;
      case "remove":
        AddOrRemoveId(false)
        break;
      case "list":
        let listEmb = new moduleHolder.Modules.discord.EmbedBuilder()
          .addFields([
            { name: "Channels:", value: currentSettings.ExcludeChannelIds.length > 0 ? currentSettings.ExcludeChannelIds.map(c => `<#${c}>`).join(", ") : "None" },
            { name: "Roles:", value: currentSettings.ExcludeRoleIds.length > 0 ? currentSettings.ExcludeRoleIds.map(r => `<@&${r}>`).join(", ") : "None" }
          ])
          .setColor(moduleHolder.Modules.discord.Colors.Blue)
          .setFooter({ text: `${moduleHolder.Modules.private.embedFooter}`, iconURL: `${bot.user.displayAvatarURL({ extension: 'png' })}` })
        message.followUp({ embeds: [listEmb] }).catch(err => console.err);
        break;
    }


    /**
  * @param {Boolean} add
  */
    async function AddOrRemoveId(add = true) {
      switch (add) {
        case true:
          if (channel && channel.type == 0) {//txt
            if (!currentSettings.ExcludeChannelIds) currentSettings.ExcludeChannelIds = [];
            if (!currentSettings.ExcludeChannelIds.includes(channel.id)) currentSettings.ExcludeChannelIds.push(channel.id)
          } else if (channel && channel.type == 4) {//category
            if (!currentSettings.ExcludeCategoryIds) currentSettings.ExcludeCategoryIds = [];
            if (!currentSettings.ExcludeCategoryIds.includes(channel.id)) currentSettings.ExcludeCategoryIds.push(channel.id)
          }
          if (role && !currentSettings.ExcludeRoleIds.includes(role.id)) currentSettings.ExcludeRoleIds.push(role.id);
          saveSettings(currentSettings);
          break;
        case false:
          if (channel && channel.type == 0) {//txt
            if (!currentSettings.ExcludeChannelIds) return;
            if (currentSettings.ExcludeChannelIds.includes(channel.id)) currentSettings.ExcludeChannelIds = currentSettings.ExcludeChannelIds.filter(id => id != channel.id)
          } else if (channel && channel.type == 4) {//category
            if (!currentSettings.ExcludeCategoryIds) return;
            if (currentSettings.ExcludeCategoryIds.includes(channel.id)) currentSettings.ExcludeCategoryIds = currentSettings.ExcludeCategoryIds.filter(id => id != channel.id)
          }
          if (role && currentSettings.ExcludeRoleIds.includes(role.id)) currentSettings.ExcludeRoleIds = currentSettings.ExcludeRoleIds.filter(id => id != role.id)
          saveSettings(currentSettings);
          break;
      }
    }



    /**
  * @param {AntiSystemModel} currentSettings
  */
    async function saveSettings(currentSettings) {
      const saved = await bot.antiSystemServices.SetAsync(currentSettings);
      switch (saved?.acknowledged ?? false) {
        case true:
          let onembed = new moduleHolder.Modules.discord.EmbedBuilder()
            .setDescription(`Succesfully ${option == 'add' ? 'added' : option == "remove" ? 'removed' : ''} ${channel ? `channel ${channel}` : ''} ${role ? ` ${role}` : ''} added  to the exclude list!`)
            .setColor(moduleHolder.Modules.discord.Colors.Blue)
            .setFooter({ text: `${moduleHolder.Modules.private.embedFooter}`, iconURL: `${bot.user.displayAvatarURL({ extension: 'png' })}` })
          message.followUp({ embeds: [onembed] }).catch(err => console.err);
          break;
        case false:
          let errorEmbed = new moduleHolder.Modules.discord.EmbedBuilder()
            .setDescription(`${moduleHolder.Modules.emojie.error} Somthing went whrong.`)
            .setColor(moduleHolder.Modules.discord.Colors.Red)
            .setFooter({ text: `${moduleHolder.Modules.private.embedFooter}`, iconURL: `${bot.user.displayAvatarURL({ extension: 'png' })}` })
          message.followUp({ embeds: [errorEmbed] }).catch(err => console.err);
          break;
      }
    }





  }
};
