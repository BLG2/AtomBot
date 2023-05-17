const InviteModel = require("../../Models/InviteModel")
const ModuleHolder = require("../../Classes/ModuleHolder")

const moduleHolder = new ModuleHolder();
module.exports = {
  help: {
    name: "logchannel",
    aliases: [],
    description: `Set the channel to log the level messages.`,
    examples: [`logchannel <#channel>`],
    permissions: 'ManageChannels',
    permissionsMe: ['none'],
    ownerOnly: false,
    file: __filename,
    arguments: [
      { name: 'channel', description: 'Channel.', required: true },
    ]
  },
  async run(bot, message, args) {
    let channel = await message.options.getChannel("channel") || null;
    const currentSettings = await bot.inviteServices.GetAsync(message.guild.id) || new InviteModel(message.guild.id);

    currentSettings.ChannelId = channel.id;
    const saved = await bot.inviteServices.SetAsync(currentSettings);
    switch (saved?.acknowledged ?? false) {
      case true:
        let onembed = new moduleHolder.Modules.discord.EmbedBuilder()
          .setDescription(`Succesfully set invite channel to ${channel}!`)
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


};
