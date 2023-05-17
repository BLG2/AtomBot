const { Guild, GuildMember } = require("discord.js");
const ModuleHolder = require("../Classes/ModuleHolder");
const moduleHolder = new ModuleHolder();

module.exports = class ValidatorHelperService {
  constructor() { }

  /**
 * @param {String} stringInput
 */
  StringIsValid(stringInput) {
    return (stringInput && stringInput != "" && stringInput != " ");
  }

  /**
 * @param {String} stringInput
 * @param {Guild} guild
 * @param {GuildMember} member
 */
  ReplaceStringTags(stringInput, guild, member) {
    let converted = stringInput && guild && member ? stringInput.replace(/((?<![\w\d])(\/n)(?![\w\d]))/g, `\n`)
      .replace(/((?<![\w\d])(@member)(?![\w\d]))/g, `${member}`)
      .replace(/((?<![\w\d])(@guildUrl)(?![\w\d]))/g, `[${guild.name}](https://discord.com/channels/${guild.id}/${guild.channels.cache.first()?.id ?? "0"}/)`)
      .replace(/((?<![\w\d])(@memberTag)(?![\w\d]))/g, `${member.user.tag}`)
      .replace(/((?<![\w\d])(@memberAvatar)(?![\w\d]))/g, `${member.user.displayAvatarURL({ dynamic: true, size: 4096 })}`)
      .replace(/((?<![\w\d])(@guildName)(?![\w\d]))/g, `${guild.name}`)
      .replace(/((?<![\w\d])(@guildIcon)(?![\w\d]))/g, `${guild.iconURL({ dynamic: true, size: 4096 })}`)
      .replace(/((?<![\w\d])(@memberCreated)(?![\w\d]))/g, `${moduleHolder.Modules.discordBuilder.time(member.user.createdAt, 'R')}`)
      .replace(/((?<![\w\d])(@memberJoined)(?![\w\d]))/g, `${moduleHolder.Modules.discordBuilder.time(member.joinedAt, 'R')}`)
      .replace(/((?<![\w\d])(@memberCount)(?![\w\d]))/g, `${guild.memberCount}`) : null;
    return converted;
  }


  /**
* @param {Number} fromNumber
* @param {Number} toNumber
* @param {Number} inputNumber
*/
  IsNumberBetween(fromNumber, toNumber, inputNumber) {
    return Number(inputNumber) ? Number(inputNumber) > Number(fromNumber) && Number(inputNumber) < Number(toNumber) : false
  }



  /**
* @param {Number} fromNumber
* @param {Number} toNumber
* @param {Number} inputNumber
*/
  IsNumberBetweenOrSame(fromNumber, toNumber, inputNumber) {
    return Number(inputNumber) ? Number(inputNumber) >= Number(fromNumber) && Number(inputNumber) <= Number(toNumber) : false
  }





  /**
* @param {String} inputTime
*/
  TimeStringToMsTime(inputTime) {
    if (!inputTime.toLowerCase().match(/^(\d)+(y|d|h|m|s)$/g)) return null;
    if (!moduleHolder.Modules.ms(inputTime)) return null;
    return moduleHolder.Modules.ms(inputTime);
  }

  /**
* @param {DoubleRange} fromTime
* @param {DoubleRange} toTime
* @param {DoubleRange} inputTime
*/
  IsTimeBetweenTmeFrames(fromTime, toTime, inputTime) {
    return (inputTime > fromTime && inputTime < toTime);
  }



  /**
* @param {String} inputHex
*/
  IsHexValid(inputHex) {
    return (inputHex && inputHex.match() ? inputHex.match(/^#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/g) : null);
  }






}
