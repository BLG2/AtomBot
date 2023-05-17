const ModuleHolder = require("../../Classes/ModuleHolder");
const moduleHolder = new ModuleHolder();

module.exports = {
  help: {
    name: "purge",
    aliases: ["clear", "deletemessage", "prune"],
    description: `Purge messages in the current channel.`,
    examples: [`purge <message amount>`, `purge <@user> <amount>`, `purge @user <amount>`, `purge embeds <amount>`, `purge url <amount>`, `purge ip <amount>`, `purge bots <amount>`, `purge humans <amount>`, `purge includes <content> <amount>`],
    permissions: 'ManageMessages',
    permissionsMe: ['ManageMessages'],
    ownerOnly: false,
    file: __filename,
    arguments: [
      { name: 'message_amount_number', description: 'Amount of messages to move', required: true, },
      { name: 'user', description: 'User to remove messages from', required: false },
      { name: 'option_string', description: 'embeds or url or ip or bots or humans or includes', required: false, options: ["embeds", "url", "ip", "bots", "humans", "includes"] },
      { name: 'content_string', description: 'message content when you choose for includes as option', required: false },
    ]
  },
  async run(bot, message, args) {

      let messageAmount = await message.options.getInteger("message_amount_number") || null

      let member = await message.options.getUser("user") || { id: '0000' }
      let user = await message.guild.members.cache.find(u => u.id === member.id) || null

      let option = await message.options.getString("option_string") || null
      let content = await message.options.getString("content_string") || null


      if (messageAmount && !user && !option && !content) {
        await message.channel.bulkDelete(messageAmount, true).then(s => {
          return message.followUp({ content: `Succesfully deleted  messages!` }).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 30000)).catch(err => console.err)
        }).catch(err => {
          return message.followUp(`Error -> ${err}`).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 30000)).catch(err => console.err)
        });
      }

      if (messageAmount && user && !option && !content) {
        message.channel.messages.fetch({ limit: 100 }).then(async (messagesfetch) => {
          let messages = await messagesfetch.filter(m => m.author.id === user.id) || null
          let SortedMessages = await messages.map(m => m)
          messages = await SortedMessages.slice(0, messageAmount);
          if (messages && messages.length !== 0) {
            message.channel.bulkDelete(messages).then(s => {
              return message.followUp(`Succesfully deleted ${s.size} messages!`).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 30000)).catch(err => console.err)
            }).catch(error => {
              return message.followUp(`Error -> ${error}`).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 30000)).catch(err => console.err)
            });
          } else {
            return message.followUp(`${moduleHolder.Modules.emojie.error} Looks like i didnt found any message from ${user.user.tag}!`).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 30000)).catch(err => console.err)
          }
        }).catch(e => { })
      }

      if (messageAmount && !user && option) {
        if (option.toLowerCase() === 'embeds') {
          await message.channel.messages.fetch({ limit: 100 }).then(async (messagesfetch) => {
            let messages = await messagesfetch.filter(m => m.embeds.length !== 0) || null
            let SortedMessages = await messages.map(m => m)
            messages = await SortedMessages.slice(0, messageAmount);
            if (messages && messages.length !== 0) {
              message.channel.bulkDelete(messages).then(s => {
                return message.followUp(`Succesfully deleted ${s.size} messages!`).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 30000)).catch(err => console.err)
              }).catch(error => {
                return message.followUp(`Error -> ${error}`).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 30000)).catch(err => console.err)
              });
            } else {
              return message.followUp(`${moduleHolder.Modules.emojie.error} Looks like i didnt found any embed message!`).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 30000)).catch(err => console.err)
            }
          }).catch(e => { })
        }
        if (option.toLowerCase() === 'url') {
          let LinkReggex = /((?:[A-z0-9](?:[A-z0-9-]{0,61}[A-z0-9])?\.)+[A-z0-9][A-z0-9-]{0,61}[A-z])|(((https?:\/\/[A-z0-9](?:[A-z0-9-]{0,61}[A-z0-9])?)+[A-z0-9][A-z0-9-]{0,61}[A-z]))/g
          await message.channel.messages.fetch({ limit: 100 }).then(async (messagesfetch) => {
            let messages = await messagesfetch.filter(m => m.content.match(LinkReggex)) || null
            let SortedMessages = await messages.map(m => m)
            messages = await SortedMessages.slice(0, messageAmount);
            if (messages && messages.length !== 0) {
              message.channel.bulkDelete(messages).then(s => {
                return message.followUp(`Succesfully deleted ${s.size} messages!`).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 30000)).catch(err => console.err)
              }).catch(error => {
                return message.followUp(`Error -> ${error}`).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 30000)).catch(err => console.err)
              });
            } else {
              return message.followUp(`${moduleHolder.Modules.emojie.error} Looks like i didnt found any message contaning urls!`).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 30000)).catch(err => console.err)
            }
          }).catch(e => { })
        }

        if (option.toLowerCase() === 'ip') {
          let IpReggex = /(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\W+(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\W+(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\W+(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)/gmi;
          await message.channel.messages.fetch({ limit: 100 }).then(async (messagesfetch) => {
            let messages = await messagesfetch.filter(m => m.content.match(IpReggex)) || null
            let SortedMessages = await messages.map(m => m)
            messages = await SortedMessages.slice(0, messageAmount);
            if (messages && messages.length !== 0) {
              message.channel.bulkDelete(messages).then(s => {
                return message.followUp(`Succesfully deleted ${s.size} messages!`).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 30000)).catch(err => console.err)
              }).catch(error => {
                return message.followUp(`Error -> ${error}`).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 30000)).catch(err => console.err)
              });
            } else {
              return message.followUp(`${moduleHolder.Modules.emojie.error} Looks like i didnt found any message ips!`).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 30000)).catch(err => console.err)
            }
          }).catch(e => { })
        }

        if (option.toLowerCase() === 'others') {
          await message.channel.messages.fetch({ limit: 100 }).then(async (messagesfetch) => {
            let messages = await messagesfetch.filter(m => m.author.id !== message.member.id) || null
            let SortedMessages = await messages.map(m => m)
            messages = await SortedMessages.slice(0, messageAmount);
            if (messages && messages.length !== 0) {
              message.channel.bulkDelete(messages).then(s => {
                return message.followUp(`Succesfully deleted ${s.size} messages!`).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 30000)).catch(err => console.err)
              }).catch(error => {
                return message.followUp(`Error -> ${error}`).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 30000)).catch(err => console.err)
              });
            } else {
              return message.followUp(`${moduleHolder.Modules.emojie.error} Looks like i didnt found any message not send by you!`).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 30000)).catch(err => console.err)
            }
          }).catch(e => { })
        }

        if (option.toLowerCase() === 'bots') {
          await message.channel.messages.fetch({ limit: 100 }).then(async (messagesfetch) => {
            let messages = await messagesfetch.filter(m => m.author.bot === true) || null
            let SortedMessages = await messages.map(m => m)
            messages = await SortedMessages.slice(0, messageAmount);
            if (messages && messages.length !== 0) {
              message.channel.bulkDelete(messages).then(s => {
                return message.followUp(`Succesfully deleted ${s.size} messages!`).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 30000)).catch(err => console.err)
              }).catch(error => {
                return message.followUp(`Error -> ${error}`).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 30000)).catch(err => console.err)
              });
            } else {
              return message.followUp(`${moduleHolder.Modules.emojie.error} Looks like i didnt found any message send by bots!`).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 30000)).catch(err => console.err)
            }
          }).catch(e => { })
        }
        if (option.toLowerCase() === 'humans') {
          await message.channel.messages.fetch({ limit: 100 }).then(async (messagesfetch) => {
            let messages = await messagesfetch.filter(m => m.author.bot === false) || null
            let SortedMessages = await messages.map(m => m)
            messages = await SortedMessages.slice(0, messageAmount);
            if (messages && messages.length !== 0) {
              message.channel.bulkDelete(messages).then(s => {
                return message.followUp(`Succesfully deleted ${s.size} messages!`).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 30000)).catch(err => console.err)
              }).catch(error => {
                return message.followUp(`Error -> ${error}`).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 30000)).catch(err => console.err)
              });
            } else {
              return message.followUp(`${moduleHolder.Modules.emojie.error} Looks like i didnt found any message send by humans!`).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 30000)).catch(err => console.err)
            }
          }).catch(e => { })
        }

        if (option.toLowerCase() === 'includes') {
          if (!content) message.followUp(`${moduleHolder.Modules.emojie.error} Pls mention the content that needs to be included in the messages!`).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 30000)).catch(err => console.err)
          await message.channel.messages.fetch({ limit: 100 }).then(async (messagesfetch) => {
            let messages = await messagesfetch.filter(m => m.content.match(content)) || null
            let SortedMessages = await messages.map(m => m)
            messages = await SortedMessages.slice(0, messageAmount);
            if (messages && messages.length !== 0) {
              message.channel.bulkDelete(messages).then(s => {
                return message.followUp(`Succesfully deleted ${s.size} messages!`).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 30000)).catch(err => console.err)
              }).catch(error => {
                return message.followUp(`Error -> ${error}`).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 30000)).catch(err => console.err)
              });
            } else {
              return message.followUp(`${moduleHolder.Modules.emojie.error} Looks like i didnt found any message!`).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 30000)).catch(err => console.err)
            }
          }).catch(e => { })
        }

      }


  }
};


