const { Message } = require("discord.js");

module.exports = class TicketMessageModel {
  content;
  components;
  embeds;
  attachments;
  user_id;
  bot;
  verified;
  username;
  nick;
  tag;
  avatar;
  created;
  edited;
  /**
* @param {Message} message
*/
  constructor(message) {
    this.content = `${message.content}`;
    this.components = message.components;
    this.embeds = message.embeds;
    this.attachments = message.attachments;
    this.user_id = `${message.author.id}`;
    this.bot = message.author.bot;
    this.verified = false;
    this.username = `${message.author.username}`;
    this.nick = `${message.member?.nickname ? message.member.nickname : message.author.username}`;
    this.tag = `${message.author.discriminator}`;
    this.avatar = `${message.author.avatar}`;
    this.id = `${message.author.id}`;
    this.created = message.createdTimestamp;
    this.edited = message.editedTimestamp;
  }

}
