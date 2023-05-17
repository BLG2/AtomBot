const ModuleHolder = require("../../Classes/ModuleHolder");
const moduleHolder = new ModuleHolder();
const ValidatorHelperService = require("../../Services/ValidatorHelperService");
const validator = new ValidatorHelperService();
module.exports = {
  help: {
    name: "embed-say",
    aliases: ["esay", "sayembed", "embed"],
    description: `Il send your message in a nice embed. (use /n for next line)`,
    examples: [`embedsay <message>`, `embedsay <title> | <message>`],
    permissions: 'ManageMessages',
    permissionsMe: ['none'],
    ownerOnly: false,
    file: __filename,
    slash: true,
    arguments: [
      { name: 'channel', description: 'Channel to send the embed', required: false },
      { name: 'message_content_string', description: 'Message Content.', required: false },
      { name: 'embed_author_content_string', description: 'Embed Author.', required: false },
      { name: 'embed_author_image_url_string', description: 'Embed Author Image Url.', required: false },
      { name: 'embed_title_content_string', description: 'Embed Title.', required: false },
      { name: 'embed_title_url_string', description: 'Embed Title Url.', required: false },
      { name: 'embed_description_content_string', description: 'Embed Description.', required: false },
      { name: 'embed_footer_content_string', description: 'Embed Footer.', required: false },
      { name: 'embed_footer_image_url_string', description: 'Embed Footer Image Url.', required: false },
      { name: 'embed_thumbnail_image_url_string', description: 'Embed Thumbnail Image Url.', required: false },
      { name: 'hex_color_string', description: 'Set the embed color.', required: false },
      { name: 'embed_image_url_string', description: 'Embed Image Url.', required: false },
    ]
  },
  async run(bot, message, args, options, isSlash) {

    let channel = await message.options.getChannel("channel") || message.channel;
    let messageContent = await message.options.getString("message_content_string") || null;
    let embedAuthor = await message.options.getString("embed_author_content_string") || null;
    let embedAuthorImageUrl = await message.options.getString("embed_author_image_url_string") || null;
    let embedTitle = await message.options.getString("embed_title_content_string") || null;
    let embedTitleUrl = await message.options.getString("embed_title_url_string") || null;
    let embedDescription = await message.options.getString("embed_description_content_string") || null;
    let embedFooter = await message.options.getString("embed_footer_content_string") || null;
    let embedFooterImage = await message.options.getString("embed_footer_image_url_string") || null;
    let embedThumbnailImage = await message.options.getString("embed_thumbnail_image_url_string") || null;
    let embedImage = await message.options.getString("embed_image_url_string") || null;
    let Color = await message.options.getString(`hex_color_string`) || null

    if (embedAuthor || embedTitle || embedDescription || embedFooter || embedThumbnailImage || embedImage) {
      let exampleEmbed = new moduleHolder.Modules.discord.EmbedBuilder()
      if (validator.StringIsValid(embedAuthor) && !validator.StringIsValid(embedAuthorImageUrl)) exampleEmbed.setAuthor({ name: `${validator.ReplaceStringTags(embedAuthor, message.guild, message.member)}` })
      if (validator.StringIsValid(embedAuthor) && validator.StringIsValid(embedAuthorImageUrl)) exampleEmbed.setAuthor({ name: `${validator.ReplaceStringTags(embedAuthor, message.guild, message.member)}`, iconURL: `${validator.ReplaceStringTags(embedAuthorImageUrl, message.guild, message.member)}` })
      if (validator.StringIsValid(embedTitle)) exampleEmbed.setTitle(`${validator.ReplaceStringTags(embedTitle, message.guild, message.member)}`)
      if (validator.StringIsValid(embedTitleUrl)) exampleEmbed.setURL(`${validator.ReplaceStringTags(embedTitleUrl, message.guild, message.member)}`)
      if (validator.StringIsValid(embedDescription)) exampleEmbed.setDescription(`${validator.ReplaceStringTags(embedDescription, message.guild, message.member)}`)
      if (validator.StringIsValid(embedThumbnailImage)) exampleEmbed.setThumbnail(`${validator.ReplaceStringTags(embedThumbnailImage, message.guild, message.member)}`)
      if (validator.StringIsValid(embedImage)) exampleEmbed.setImage(`${validator.ReplaceStringTags(embedImage, message.guild, message.member)}`)
      if (Color != null && !validator.IsHexValid(Color)) return message.followUp(`\n${moduleHolder.Modules.emojie.error} ${Color} is not a valid HEX color.`).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err);
      if (Color != null) exampleEmbed.setColor(Color)
      if (validator.StringIsValid(embedFooter) && !validator.StringIsValid(embedFooterImage)) exampleEmbed.setFooter({ text: `${validator.ReplaceStringTags(embedFooter, message.guild, message.member)}` })
      if (validator.StringIsValid(embedFooter) && validator.StringIsValid(embedFooterImage)) exampleEmbed.setFooter({ text: `${validator.ReplaceStringTags(embedFooter, message.guild, message.member)}`, iconURL: `${validator.ReplaceStringTags(embedFooterImage, message.guild, message.member)}` })

      channel.send({
        content: validator.StringIsValid(messageContent) ? validator.ReplaceStringTags(messageContent, message.guild, message.member) : null,
        embeds: [exampleEmbed]
      }).then(msg => {
        message.followUp({ content: `Succesfully sent your [message](${msg.url})` }).catch(err => console.err);
      }).catch(err => message.followUp(`Error -> ${err}`))
    } else if (messageContent) {
      channel.send({
        content: validator.StringIsValid(messageContent) ? validator.ReplaceStringTags(messageContent, message.guild, message.member) : "Unknown content.",
      }).then(msg => {
        message.followUp({ content: `Succesfully sent your [message](${msg.url})` }).catch(err => console.err);
      }).catch(err => message.followUp(`Error -> ${err}`))
    } else {
      message.followUp({ content: `Mention at least one of the message options` }).catch(err => console.err);
    }


  }
};
