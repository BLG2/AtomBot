const ModuleHolder = require("../../Classes/ModuleHolder")
const GiveawayModel = require("../../Models/GiveawayModel");

const moduleHolder = new ModuleHolder();
module.exports = {
  help: {
    name: "exclude-role",
    aliases: [],
    description: `Add or remove a role from the exclude giveaway system sys.`,
    examples: [`exclude-role <@role>`],
    permissions: 'ManageRoles',
    permissionsMe: ['none'],
    ownerOnly: false,
    file: __filename,
    arguments: [
      { name: 'message_id_string', description: 'channel to send the giveaway embed', required: true },
      { name: 'option_string', description: 'add or remove or list', required: true, options: ["add", "remove", "list"] },
      { name: 'role', description: 'Role to add or remove.', required: false },
    ]
  },
  async run(bot, message, args) {

    let messageID = await message.options.getString("message_id_string") || "00";
    let option = await message.options.getString("option_string");
    let role = await message.options.getRole("role") || null


    let currentSettings = await bot.giveawayServices.GetAsync(message.guild.id, messageID) || null;
    if (!currentSettings) return message.followUp(`There is no giveaway with message id: ${messageID}`)

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
          if (role && !currentSettings.ExcludeRoleIds.includes(role.id)) currentSettings.ExcludeRoleIds.push(role.id);
          saveSettings(currentSettings);
          break;
        case false:
          if (role && currentSettings.ExcludeRoleIds.includes(role.id)) currentSettings.ExcludeRoleIds = currentSettings.ExcludeRoleIds.filter(id => id != role.id)
          saveSettings(currentSettings);
          break;
      }
    }



    /**
  * @param {GiveawayModel} currentSettings
  */
    async function saveSettings(currentSettings) {
      const saved = await bot.giveawayServices.UpdateAsync(currentSettings);
      switch (saved?.acknowledged ?? false) {
        case true:
          let embed = new moduleHolder.Modules.discord.EmbedBuilder()
            .setColor(moduleHolder.Modules.discord.Colors.Blue)
            .setDescription(`Succesfully ${option == 'add' ? 'added' : option == "remove" ? 'removed' : ''} ExcludeRole ${role} to [giveaway](https://discord.com/channels/${message.guild.id}/${currentSettings.ChannelId}/${currentSettings.MessageId})`)
          message.followUp({ embeds: [embed] }).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err);

          if (currentSettings.LogChannelId && currentSettings.LogChannelId != "000") {
            let logChannel = message.guild.channels.cache.get(currentSettings?.LogChannelId ?? "000").catch(e => { }) || null;
            let embed = new moduleHolder.Modules.discord.EmbedBuilder()
              .setColor(moduleHolder.Modules.discord.Colors.Blue)
              .setAuthor({ name: `Giveaway has been Updated (${option == 'add' ? 'added' : option == "remove" ? 'removed' : ''} ExcludeRole ${role})!`, iconURL: `${bot.user.displayAvatarURL({ extension: 'png' })}`, url: `https://discord.com/channels/${message.guild.id}/${currentSettings.ChannelId}/${currentSettings.MessageId}` })
              .addFields([{ name: `Executor:`, value: `${message.member} | ${message.member.user.tag}` }])
            try { logChannel?.send({ embeds: [embed] }).catch(err => { }); } catch (e) { }
          }
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
