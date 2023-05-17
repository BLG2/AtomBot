const WelcomeLeaveModel = require("../../Models/WelcomeLeaveModel")
const ModuleHolder = require("../../Classes/ModuleHolder");
const WelcomeLeaveEmbedModel = require("../../Models/WelcomeLeaveEmbedModel");
const ValidatorHelperService = require("../../Services/ValidatorHelperService");
const validator = new ValidatorHelperService();

const moduleHolder = new ModuleHolder();
module.exports = {
  help: {
    name: "embed",
    aliases: [],
    description: `Set the welcome-leave message.`,
    examples: [`embed <message>`],
    permissions: 'ManageMessages',
    permissionsMe: ['none'],
    ownerOnly: false,
    file: __filename,
    arguments: [
      { name: 'option_string', description: 'set the welcome or leave channel', required: true, options: ["welcome", "leave", "reset"] },
      { name: 'message_content_string', description: 'Message Content.', required: false },
      { name: 'embed_author_content_string', description: 'Embed Author.', required: false },
      { name: 'embed_author_image_url_string', description: 'Embed Author Image Url.', required: false },
      { name: 'embed_title_content_string', description: 'Embed Title.', required: false },
      { name: 'embed_title_url_string', description: 'Embed Title Url.', required: false },
      { name: 'embed_description_content_string', description: 'Embed Description.', required: false },
      { name: 'embed_footer_content_string', description: 'Embed Footer.', required: false },
      { name: 'embed_footer_image_url_string', description: 'Embed Footer Image Url.', required: false },
      { name: 'embed_thumbnail_image_url_string', description: 'Embed Thumbnail Image Url.', required: false },
      { name: 'embed_image_url_string', description: 'Embed Image Url.', required: false },
    ]
  },
  async run(bot, message, args) {
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

    const currentSettings = await bot.guildSettingsServices.GetWelcomeLeaveAsync(message.guild.id) || new WelcomeLeaveModel(message.guild.id);

    let option = await message.options.getString("option_string");
    switch (option) {
      case "welcome":
        if (validator.StringIsValid(messageContent)) currentSettings.WelcomeEmbed.MessageContent = messageContent;
        if (validator.StringIsValid(embedAuthor)) currentSettings.WelcomeEmbed.EmbedAuthor = embedAuthor;
        if (validator.StringIsValid(embedAuthorImageUrl)) currentSettings.WelcomeEmbed.EmbedAuthorImageUrl = embedAuthorImageUrl;
        if (validator.StringIsValid(embedTitle)) currentSettings.WelcomeEmbed.EmbedTitle = embedTitle;
        if (validator.StringIsValid(embedTitleUrl)) currentSettings.WelcomeEmbed.EmbedTitleUrl = embedTitleUrl;
        if (validator.StringIsValid(embedDescription)) currentSettings.WelcomeEmbed.EmbedDescription = embedDescription;
        if (validator.StringIsValid(embedFooter)) currentSettings.WelcomeEmbed.EmbedFooter = embedFooter;
        if (validator.StringIsValid(embedFooterImage)) currentSettings.WelcomeEmbed.EmbedFooterImageUrl = embedFooterImage;
        if (validator.StringIsValid(embedThumbnailImage)) currentSettings.WelcomeEmbed.EmbedThumbnailImageUrl = embedThumbnailImage;
        if (validator.StringIsValid(embedImage)) currentSettings.WelcomeEmbed.EmbedImageUrl = embedImage;
        if (!messageContent && !embedAuthor && !embedAuthorImageUrl && !embedTitle && !embedTitleUrl && !embedDescription && !embedFooter && !embedFooterImage && !embedThumbnailImage && !embedImage) {
          currentSettings.WelcomeEmbed = new WelcomeLeaveEmbedModel(message.guild.id, "Hi, @memberTag", "@memberAvatar", null, null, "Welcome to our server pls read our rules.", null, "@guildName - MemberCount: @memberCount", "@guildIcon", null);
        }
        break;
      case "leave":
        if (validator.StringIsValid(messageContent)) currentSettings.LeaveEmbed.MessageContent = messageContent;
        if (validator.StringIsValid(embedAuthor)) currentSettings.LeaveEmbed.EmbedAuthor = embedAuthor;
        if (validator.StringIsValid(embedAuthorImageUrl)) currentSettings.LeaveEmbed.EmbedAuthorImageUrl = embedAuthorImageUrl;
        if (validator.StringIsValid(embedTitle)) currentSettings.LeaveEmbed.EmbedTitle = embedTitle;
        if (validator.StringIsValid(embedTitleUrl)) currentSettings.LeaveEmbed.EmbedTitleUrl = embedTitleUrl;
        if (validator.StringIsValid(embedDescription)) currentSettings.LeaveEmbed.EmbedDescription = embedDescription;
        if (validator.StringIsValid(embedFooter)) currentSettings.LeaveEmbed.EmbedFooter = embedFooter;
        if (validator.StringIsValid(embedFooterImage)) currentSettings.LeaveEmbed.EmbedFooterImageUrl = embedFooterImage;
        if (validator.StringIsValid(embedThumbnailImage)) currentSettings.LeaveEmbed.EmbedThumbnailImageUrl = embedThumbnailImage;
        if (validator.StringIsValid(embedImage)) currentSettings.WelcomeEmbed.LeaveEmbed = embedImage;
        if (!messageContent && !embedAuthor && !embedAuthorImageUrl && !embedTitle && !embedTitleUrl && !embedDescription && !embedFooter && !embedFooterImage && !embedThumbnailImage && !embedImage) {
          currentSettings.LeaveEmbed = new WelcomeLeaveEmbedModel(message.guild.id, "@memberTag left the server.", "@memberAvatar", null, null, "Member joined: @memberJoined", null, "@guildName - MemberCount: @memberCount", "@guildIcon", null);
        }
        break;
      case "reset":
        currentSettings.WelcomeEmbed = new WelcomeLeaveEmbedModel(null, null, null, null, null, null, null, null, null, null);
        currentSettings.LeaveEmbed = new WelcomeLeaveEmbedModel(null, null, null, null, null, null, null, null, null, null);
        break;
    }
    const saved = await bot.guildSettingsServices.SetWelcomeLeaveAsync(currentSettings);
    switch (saved?.acknowledged ?? false) {
      case true:
        let onembed = new moduleHolder.Modules.discord.EmbedBuilder()
          .setDescription(`Succesfully set ${option} embed to the embed displayed below!`)
          .setColor(moduleHolder.Modules.discord.Colors.Blue)
          .setFooter({ text: `${moduleHolder.Modules.private.embedFooter}`, iconURL: `${bot.user.displayAvatarURL({ extension: 'png' })}` })
        message.followUp({ embeds: [onembed] }).then(async msg => {
          if (option == "reset") return;
          let embedType = option == "welcome" ? "WelcomeEmbed" : "LeaveEmbed"

          if (currentSettings[embedType].EmbedAuthor || currentSettings[embedType].EmbedTitle || currentSettings[embedType].EmbedDescription || currentSettings[embedType].EmbedFooter || currentSettings[embedType].EmbedThumbnailImageUrl || currentSettings[embedType].EmbedImageUrl) {
            let exampleEmbed = new moduleHolder.Modules.discord.EmbedBuilder()
            if (validator.StringIsValid(currentSettings[embedType].EmbedAuthor)) exampleEmbed.setAuthor({ name: `${validator.ReplaceStringTags(currentSettings[embedType].EmbedAuthor, message.guild, message.member)}`, iconURL: `${validator.ReplaceStringTags(currentSettings[embedType].EmbedAuthorImageUrl, message.guild, message.member)}` })
            if (validator.StringIsValid(currentSettings[embedType].EmbedTitle)) exampleEmbed.setTitle(`${validator.ReplaceStringTags(currentSettings[embedType].EmbedTitle, message.guild, message.member)}`)
            if (validator.StringIsValid(currentSettings[embedType].EmbedTitleUrl)) exampleEmbed.setURL(`${validator.ReplaceStringTags(currentSettings[embedType].EmbedTitleUrl, message.guild, message.member)}`)
            if (validator.StringIsValid(currentSettings[embedType].EmbedDescription)) exampleEmbed.setDescription(`${validator.ReplaceStringTags(currentSettings[embedType].EmbedDescription, message.guild, message.member)}`)
            if (validator.StringIsValid(currentSettings[embedType].EmbedThumbnailImageUrl)) exampleEmbed.setThumbnail(`${validator.ReplaceStringTags(currentSettings[embedType].EmbedThumbnailImageUrl, message.guild, message.member)}`)
            if (validator.StringIsValid(currentSettings[embedType].EmbedImageUrl)) exampleEmbed.setImage(`${validator.ReplaceStringTags(currentSettings[embedType].EmbedImageUrl, message.guild, message.member)}`)
            exampleEmbed.setColor(moduleHolder.Modules.discord.Colors.Blue)
            if (validator.StringIsValid(currentSettings[embedType].EmbedFooter)) exampleEmbed.setFooter({ text: `${validator.ReplaceStringTags(currentSettings[embedType].EmbedFooter, message.guild, message.member)}`, iconURL: `${validator.ReplaceStringTags(currentSettings[embedType].EmbedFooterImageUrl, message.guild, message.member)}` })
            msg.reply({ content: validator.StringIsValid(currentSettings[embedType].MessageContent) ? validator.ReplaceStringTags(currentSettings[embedType].MessageContent, message.guild, message.member) : null, embeds: [exampleEmbed] }).catch(err => msg.reply(`Error -> ${err}`))
          } else {
            msg.reply({ content: validator.StringIsValid(currentSettings[embedType].MessageContent) ? validator.ReplaceStringTags(currentSettings[embedType].MessageContent, message.guild, message.member) : "Unknown content." }).catch(err => msg.reply(`Error -> ${err}`))
          }

        }).catch(err => message.followUp(`Error -> ${err}`))
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

