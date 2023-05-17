const ModuleHolder = require("../../Classes/ModuleHolder");
const VerificationModel = require("../../Models/VerificationModel");

const moduleHolder = new ModuleHolder();
module.exports = {
  help: {
    name: "channel",
    aliases: [],
    description: `Set the channel to send the verification message.`,
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
    const currentSettings = await bot.verificationServices.GetAsync(message.guild.id) || new VerificationModel(message.guild.id);

    currentSettings.ChannelId = channel.id;

    const saved = await bot.verificationServices.SetAsync(currentSettings);
    switch (saved?.acknowledged ?? false) {
      case true:
        let onembed = new moduleHolder.Modules.discord.EmbedBuilder()
          .setDescription(`Succesfully set verification channel to ${channel}!`)
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
