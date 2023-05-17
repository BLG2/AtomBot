const TicketModel = require("../../Models/TicketModel")
const ModuleHolder = require("../../Classes/ModuleHolder")

const moduleHolder = new ModuleHolder();
module.exports = {
  help: {
    name: "role-to-tag",
    aliases: [],
    description: `Add or remove a role from the ticket role to tag sys.`,
    examples: [`role-to-tag <@role>`],
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

    const currentSettings = await bot.ticketServices.GetAsync(message.guild.id) || new TicketModel(message.guild.id);

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
            { name: "Roles:", value: currentSettings.RolesToTagIds.length > 0 ? currentSettings.RolesToTagIds.map(r => `<@&${r}>`).join(", ") : "None" }
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
          if (role && currentSettings.RolesToTagIds && !currentSettings.RolesToTagIds.includes(role.id)) currentSettings.RolesToTagIds.push(role.id);
          saveSettings(currentSettings);
          break;
        case false:
          if (role && currentSettings.RolesToTagIds && currentSettings.RolesToTagIds.includes(role.id)) currentSettings.RolesToTagIds = currentSettings.RolesToTagIds.filter(id => id != role.id)
          saveSettings(currentSettings);
          break;
      }
    }



    /**
  * @param {TicketModel} currentSettings
  */
    async function saveSettings(currentSettings) {
      const saved = await bot.ticketServices.SetAsync(currentSettings);
      switch (saved?.acknowledged ?? false) {
        case true:
          let onembed = new moduleHolder.Modules.discord.EmbedBuilder()
            .setDescription(`Succesfully ${option == 'add' ? 'added' : option == "remove" ? 'removed' : ''} ${role ? ` ${role}` : ''} added ${option == 'add' ? 'to' : option == "remove" ? 'from' : ''} the ticket tag role list!\n(when a ticket is opened these roles wil be tagged)`)
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
