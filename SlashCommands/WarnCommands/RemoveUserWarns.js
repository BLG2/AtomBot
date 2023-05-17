const ModuleHolder = require("../../Classes/ModuleHolder");
const moduleHolder = new ModuleHolder();

module.exports = {
  help: {
    name: "remove",
    aliases: [],
    description: `Remove a user its warnings.`,
    examples: [`remove <user>`],
    permissions: 'ManageMessages',
    permissionsMe: ['ManageMessages'],
    ownerOnly: false,
    file: __filename,
    arguments: [
      { name: 'user', description: 'user', required: true },
      { name: 'option_string', description: 'choises', required: false, options: ["Server", "Link", "MaliciousLink", "Ip", "Selfbot", "Spam"] },
    ]
  },
  async run(bot, message, args) {
    let option = await message.options.getString("option_string") || null;
    let member = await message.options.getUser("user") || { id: '0000' }
    let user = await message.guild.members.cache.find(u => u.id === member.id) || null
    let userWarns = await bot.warnServices.GetAllFromUserAsync(message.guild.id, user.id) || null;

    if (option) {
      var fetchedWarn = userWarns.find(w => w.WarnType == option) || null;
      if (fetchedWarn) {
        let deleted = await bot.warnServices.RemoveAsync(message.guild.id, user.id, option)
        switch (deleted?.acknowledged ?? false) {
          case true:
            let onembed = new moduleHolder.Modules.discord.EmbedBuilder()
              .setDescription(`Succesfully deleted ${user.user.tag}'s ${option} warnings.`)
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
    } else {
      let deletedItems = [];
      await userWarns.map(async w => {
        let deleted = await bot.warnServices.RemoveAsync(message.guild.id, user.id, w.WarnType)
        if (deleted && deleted?.acknowledged === true) {
          deletedItems.push(w);
        }
      });
      setTimeout(() => {
        let onembed = new moduleHolder.Modules.discord.EmbedBuilder()
          .setDescription(`Succesfully deleted ${user.user.tag}'s warnings.`)
          .setColor(moduleHolder.Modules.discord.Colors.Blue)
          .setDescription(`Deleted ${deletedItems.length} items.`)
          .setFooter({ text: `${moduleHolder.Modules.private.embedFooter}`, iconURL: `${bot.user.displayAvatarURL({ extension: 'png' })}` })
        message.followUp({ embeds: [onembed] }).catch(err => console.err);
      }, 5000);
    }
  }
};

