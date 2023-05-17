const WelcomeLeaveModel = require("../../Models/WelcomeLeaveModel")
const ModuleHolder = require("../../Classes/ModuleHolder")

const moduleHolder = new ModuleHolder();
module.exports = {
  help: {
    name: "channel",
    aliases: [],
    description: `Set the channel to send the welcome-leave message.`,
    examples: [`channel <#channel>`],
    permissions: 'ManageChannels',
    permissionsMe: ['none'],
    ownerOnly: false,
    file: __filename,
    arguments: [
      { name: 'option_string', description: 'set the welcome or leave channel', required: true, options: ["welcome", "leave"] },
      { name: 'channel', description: 'Channel.', required: true },
    ]
  },
  async run(bot, message, args) {
    let channel = await message.options.getChannel("channel") || null;
    const currentSettings = await bot.verificationServices.GetAsync(message.guild.id) || new WelcomeLeaveModel(message.guild.id);
    let option = await message.options.getString("option_string");
    switch (option) {
      case "welcome":
        currentSettings.WelcomeChannelId = channel.id;
        break;
      case "leave":
        currentSettings.LeaveChannelId = channel.id;
        break;
    }
    const saved = await bot.verificationServices.SetAsync(currentSettings);
    switch (saved?.acknowledged ?? false) {
      case true:
        let onembed = new moduleHolder.Modules.discord.EmbedBuilder()
          .setDescription(`Succesfully set ${option} channel to ${channel}!`)
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
