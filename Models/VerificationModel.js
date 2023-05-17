module.exports = class VerificationModel {
  GuildId;
  VerifiedRoleId;
  UnVerifiedRoleId;
  ChannelId;
  VerifyMessage;
  MessageId
  VerifiedMessage;
  Enabled;
  /**
* @param {String} guildId
* @param {String} verifiedRoleId
* @param {String} unVerifiedRoleId
* @param {String} channelId
* @param {String} verifyMessage
* @param {String} messageId
* @param {String} verifiedMessage
* @param {Boolean} enabled
*/
  constructor(guildId, verifiedRoleId = "000", unVerifiedRoleId = "000", channelId = "000", verifyMessage = "Verify by clicking the ✅ below!", verifiedMessage = "Succesfully verifyed in @guildUrl", messageId = "000", enabled = false) {
    this.GuildId = guildId;
    this.VerifiedRoleId = verifiedRoleId;
    this.UnVerifiedRoleId = unVerifiedRoleId;
    this.ChannelId = channelId;
    this.VerifyMessage = verifyMessage;
    this.VerifiedMessage = verifiedMessage;
    this.MessageId = messageId;
    this.Enabled = enabled;
  }

}
