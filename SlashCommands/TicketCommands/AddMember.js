const ModuleHolder = require("../../Classes/ModuleHolder");
const moduleHolder = new ModuleHolder();
module.exports = {
  help: {
    name: "add-remove-member",
    aliases: ["armem"],
    description: `Add/Remove a member to the ticket.`,
    examples: [`armem <option> <#channel> <@member>`],
    permissions: 'ManageChannels',
    permissionsMe: ['ManageChannels'],
    ownerOnly: false,
    file: __filename,
    arguments: [
      { name: 'option_string', description: 'choises', required: true, options: ["Add", "Remove"] },
      { name: 'ticket_channel', description: 'Channel', required: true },
      { name: 'user', description: 'user to set the level', required: false },
    ]
  },
  async run(bot, message, args) {
    let option = await message.options.getString("option_string") || "Remove";
    let user = await message.options.getUser("user") || { id: '0000' }
    let member = await message.guild.members.cache.find(u => u.id === user.id) || null;
    if (!member) return message.followUp(`Pls provide the member!`).catch(err => console.err);
    let channel = await message.options.getChannel("ticket_channel") || null
    if (!channel) return message.followUp(`Pls provide the channel!`).catch(err => console.err);

    const openTicket = await bot.ticketServices.GetOpenTicketByChannelAsync(message.guild.id, channel.id) || null;
    if (!openTicket) return message.followUp({ content: `Looks like this ticket doesnt exist in the db.` }).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err);

    switch (option) {
      case "Add":
        channel.permissionOverwrites.create(member.id, {
          ManageMessages: false,
          SendMessages: true,
          ViewChannel: true,
          AddReactions: true,
          ReadMessageHistory: true,
          AttachFiles: true
        }).then(s => {
          return message.followUp(`Added ${member.user.tag} to this ticket`).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err)
        }).catch(e => {
          return message.followUp(`Looks like somthin went whrong -> ${e}`).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err)
        })
        break;
      case "Remove":
        channel.permissionOverwrites.create(member.id, {
          ManageMessages: false,
          SendMessages: false,
          ViewChannel: false,
          AddReactions: false,
          ReadMessageHistory: false,
          AttachFiles: false
        }).then(s => {
          return message.followUp(`Removed ${member.user.tag} to this ticket`).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err)
        }).catch(e => {
          return message.followUp(`Looks like somthin went whrong -> ${e}`).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err)
        })
        break;
    }


  }
};


