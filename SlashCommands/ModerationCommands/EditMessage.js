const ModuleHolder = require("../../Classes/ModuleHolder");
const ValidatorHelperService = require("../../Services/ValidatorHelperService");
const moduleHolder = new ModuleHolder();
const validator = new ValidatorHelperService();

module.exports = {
  help: {
    name: "edit-message",
    aliases: ["eem"],
    description: `Edit an embed message send by me. (just place / to make remove somthing!)`,
    examples: [`embedsay <message>`, `embedsay <title> | <message>`],
    permissions: 'ManageMessages',
    permissionsMe: ['ManageMessages'],
    ownerOnly: false,
    file: __filename,
    slash: true,
    arguments: [
      { name: 'channel', description: 'Channel where i need to find the message', required: true },
      { name: 'message_id_string', description: 'ID of the message i need to edit', required: true },
      { name: 'message_content_string', description: 'Set the messageContent (normal message)', required: false },
      { name: 'description_string', description: 'Set the description of the embed', required: false },
      { name: 'title_string', description: 'Set the title of the embed', required: false },
      { name: 'title_url_string', description: 'Set a url in the title', required: false },
      { name: 'footer_string', description: 'Set the footer of the embed', required: false },
      { name: 'thumbnail_string', description: 'Set the thumbnail of the embed (image url)', required: false },
      { name: 'image_string', description: 'Set the image of the embed (image url)', required: false },
      { name: 'emoji_reaction_string', description: 'Emoji to react on the message.', required: false },
      { name: 'hex_color_string', description: 'Set the embed color.', required: false },
      { name: 'remove_fields_string', description: 'do you want to remove the embed fields?', required: false, options: ["yes"] },
    ]
  },
  async run(bot, message, args, options, isSlash) {

    let channel = await message.options.getChannel("channel") || null
    let messageID = await message.options.getString("message_id_string") || '001234'

    let messageContent = await message.options.getString("message_content_string") || null
    let Title = await message.options.getString("title_string") || null
    let Description = await message.options.getString("description_string") || null
    let Footer = await message.options.getString("footer_string") || null
    let Thumbnail = await message.options.getString("thumbnail_string") || null
    let Image = await message.options.getString("image_string") || null
    let TitleUrl = await message.options.getString("title_url_string") || null
    let Emoji = await message.options.getString(`emoji_reaction_string`) || null
    let Color = await message.options.getString(`hex_color_string`) || null
    let removeFields = await message.options.getString("remove_fields_string") || 'no'

    let fetchedMessage = channel ? await channel.messages.fetch(messageID).catch(err => console.err) || null : null
    if (fetchedMessage) {
      if (fetchedMessage.embeds && fetchedMessage.embeds.length > 0) {

        let embed = fetchedMessage.embeds[0];
        let newEmbed = new moduleHolder.Modules.discord.EmbedBuilder();
        if (Title != "/") newEmbed.setTitle(validator.StringIsValid(Title) ? `${Title}` : embed?.title ? `${embed.title}` : null);
        if (TitleUrl != "/") newEmbed.setURL(validator.StringIsValid(TitleUrl) ? `${TitleUrl}` : embed?.url ? `${embed.url}` : null);
        if (Description != "/") newEmbed.setDescription(validator.StringIsValid(Description) ? `${Description}` : embed?.description ? `${embed.description}` : null);
        if (Thumbnail != "/") newEmbed.setThumbnail(validator.StringIsValid(Thumbnail) ? `${Thumbnail}` : embed?.thumbnail && embed?.thumbnail?.proxyURL ? `${embed.thumbnail.proxyURL}` : null);
        if (Image != "/") newEmbed.setImage(validator.StringIsValid(Image) ? `${Image}` : embed?.image && embed?.image?.url ? `${embed.image.url}` : null);
        if (Footer != "/") newEmbed.setFooter({ text: validator.StringIsValid(Footer) ? `${Footer}` : embed?.footer && embed?.footer?.text ? `${embed.footer.text}` : null });
        if ((validator.StringIsValid(Color) && Color != "/") && !validator.IsHexValid(Color)) return message.followUp(`\n${moduleHolder.Modules.emojie.error} ${Color} is not a valid HEX color.`).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err);
        if (Color != "/") newEmbed.setColor(validator.StringIsValid(Color) ? `${Color}` : embed?.hexColor ? `${embed.hexColor}` : null);
        if (removeFields.toLowerCase() === 'no') newEmbed.fields = embed?.fields ?? [];
        fetchedMessage.embeds[0] = newEmbed;

        if (Emoji !== null) {
          if (Emoji === '/') {
            fetchedMessage.reactions.removeAll()
          } else {
            let emoji1 = await bot.emojis.cache.find(emj => emj.name === Emoji) || bot.emojis.cache.find(emj => emj.id === Emoji) || bot.emojis.cache.find(emj => `<${emj.identifier}>` === Emoji) || bot.emojis.cache.find(emj => `<:${emj.identifier}>` === Emoji) || Emoji
            if (emoji1) {
              fetchedMessage.react(emoji1)
            } else {
              return message.followUp(`${moduleHolder.Modules.emojie.error} Could not find mentioned emoji`).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 1600000)).catch(err => console.err);
            }
          }
        }

        await fetchedMessage.edit({
          content: validator.StringIsValid(messageContent) && messageContent !== '/' ? `${messageContent}` : validator.StringIsValid(fetchedMessage.content) && messageContent !== '/' ? `${fetchedMessage.content}` : ' ',
          embeds: fetchedMessage.embeds && fetchedMessage.embeds.length > 0 ? fetchedMessage.embeds : [],
        }).then(async msg => {
          let embed = new moduleHolder.Modules.discord.EmbedBuilder()
          embed.setDescription(`[Succesfully edited message!](${msg.url})`)
          return message.followUp({ embeds: [embed] }).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 30000)).catch(err => console.err);
        }).catch(err => {
          message.followUp({ content: `ERROR: ${err}` }).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 30000)).catch(err => console.err);
        })

      } else {
        return message.followUp(`\n${moduleHolder.Modules.emojie.error} Looks like this message isnt an embed message!`).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err);
      }
    } else {
      return message.followUp(`\n${moduleHolder.Modules.emojie.error} Could not find any message with ID: **${messageID}** in channel: **${channel.name}**!`).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err);
    }

  }
};
