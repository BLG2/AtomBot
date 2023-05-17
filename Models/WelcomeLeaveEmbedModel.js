
module.exports = class WelcomeLeaveEmbedModel {
  MessageContent;
  EmbedAuthor;
  EmbedAuthorImageUrl;
  EmbedTitle;
  EmbedTitleUrl;
  EmbedDescription;
  EmbedThumbnailImageUrl;
  EmbedFooter;
  EmbedFooterImageUrl;
  EmbedImageUrl;
  /**
* @param {String} messageContent
* @param {String} embedAuthor
* @param {String} embedAuthorImageUrl
* @param {String} embedTitle
* @param {String} embedTitleUrl
* @param {String} embedDescription
* @param {String} embedThumbnailImageUrl
* @param {String} embedFooter
* @param {String} embedFooterImageUrl
* @param {String} embedImageUrl
*/
  constructor(
    messageContent = "Hi @member",
    embedAuthor = "test",
    embedAuthorImageUrl = "https://i.imgur.com/gQ2VhZZ.png",
    embedTitle = "Title",
    embedTitleUrl = "https://i.imgur.com/gQ2VhZZ.png",
    embedDescription = "Welcome to our server @memberTag.",
    embedThumbnailImageUrl = "@memberAvatar",
    embedFooter = "@guildName",
    embedFooterImageUrl = "@guildIcon",
    embedImageUrl = "https://i.imgur.com/gQ2VhZZ.png"
  ) {
    this.MessageContent = messageContent;
    this.EmbedAuthor = embedAuthor;
    this.EmbedAuthorImageUrl = embedAuthorImageUrl;
    this.EmbedTitle = embedTitle;
    this.EmbedTitleUrl = embedTitleUrl;
    this.EmbedDescription = embedDescription;
    this.EmbedThumbnailImageUrl = embedThumbnailImageUrl;
    this.EmbedFooter = embedFooter;
    this.EmbedFooterImageUrl = embedFooterImageUrl;
    this.EmbedImageUrl = embedImageUrl;
  }

}
