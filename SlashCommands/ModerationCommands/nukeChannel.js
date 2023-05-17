const ModuleHolder = require("../../Classes/ModuleHolder");
const moduleHolder = new ModuleHolder();

module.exports = {
  help: {
    name: "nuke-channel",
    aliases: ["nukechannel"],
    description: `Nuke the current channel (delete and recreate a channel).`,
    examples: [`nuke`],
    permissions: 'ManageChannels',
    permissionsMe: ['ManageChannels'],
    ownerOnly: false,
    file: __filename,
    arguments: [
      { name: 'channel', description: 'Channel to nuke.', required: false },
    ]
  },
  async run(bot, message, args) {
      let channel = await message.options.getChannel("channel") || message.channel

      let replies = [
        "https://imgur.com/BcjXjqm.gif",
        "https://imgur.com/27kGNAM.gif",
        "https://imgur.com/2zwYg8q.gif",
        "https://imgur.com/Yh9oimz.gif",
        "https://imgur.com/Ux2E1HC.gif",
        "https://imgur.com/6WzfRpC.gif",
        "https://imgur.com/p7svi3J.gif",
        "https://imgur.com/49ef9IJ.gif",
        "https://imgur.com/OUGOYIb.gif"
      ];

      let result = Math.floor((Math.random() * replies.length));

      // console.log(channel)
      let pos = channel.position;
      let top = channel.topic;
      let nsfw = channel.nsfw;
      let kategoriID = channel.parentId;
      await channel.clone(this.name, true, true).then(kanal => {
        let z = kanal.guild.channels.cache.get(kanal.id);
        if (kategoriID !== null) {
          z.setParent(z.guild.channels.cache.find(channel => channel.id === kategoriID));
        }
        z.edit({ position: pos, topic: top, nsfw: nsfw });
        const embed = new moduleHolder.Modules.discord.EmbedBuilder()
          .setTitle('Channel has been NUKED!')
          .setColor(moduleHolder.Modules.discord.Colors.Blue)
          .setImage(replies[result]);
        z.send({ embeds: [embed] }).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err);
      }).catch(err => console.error);
      await channel.delete().catch(err => console.error);

  }
};
