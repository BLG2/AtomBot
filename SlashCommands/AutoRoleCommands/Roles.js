const AutoRoleModel = require("../../Models/AutoRoleModel")
const ModuleHolder = require("../../Classes/ModuleHolder")

const moduleHolder = new ModuleHolder();
module.exports = {
  help: {
    name: "role",
    aliases: [],
    description: `Add or remove a role from the autorole sys.`,
    examples: [`autorole <@role>`],
    permissions: 'ManageRoles',
    permissionsMe: ['none'],
    ownerOnly: false,
    file: __filename,
    arguments: [
      { name: 'option_string', description: 'add or remove or list', required: true, options: ["add", "remove", "list"] },
      { name: 'role', description: 'Role to add or remove.', required: false },
    ]
  },
  async run(bot, message, args) {

    let option = await message.options.getString("option_string");
    let role = await message.options.getRole("role") || null

    const currentSettings = await bot.autoRoleServices.GetAsync(message.guild.id) || new AutoRoleModel(message.guild.id);

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
            { name: "Roles:", value: currentSettings.RoleIds.length > 0 ? currentSettings.RoleIds.map(r => `<@&${r}>`).join(", ") : "None" }
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
          if (role && !currentSettings.RoleIds.includes(role.id)) currentSettings.RoleIds.push(role.id);
          saveSettings(currentSettings);
          break;
        case false:
          if (role && currentSettings.RoleIds.includes(role.id)) currentSettings.RoleIds = currentSettings.RoleIds.filter(id => id != role.id)
          saveSettings(currentSettings);
          break;
      }
    }



    /**
  * @param {AutoRoleModel} currentSettings
  */
    async function saveSettings(currentSettings) {
      const saved = await bot.autoRoleServices.SetAsync(currentSettings);
      switch (saved?.acknowledged ?? false) {
        case true:
          let onembed = new moduleHolder.Modules.discord.EmbedBuilder()
            .setDescription(`Succesfully ${option == 'add' ? 'added' : option == "remove" ? 'removed' : ''} ${role ? ` ${role}` : ''} added ${option == 'add' ? 'to' : option == "remove" ? 'from' : ''} the autorole list!`)
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
