const ModuleHolder = require("../../Classes/ModuleHolder");
const moduleHolder = new ModuleHolder();

module.exports = {
  help: {
    name: "trans",
    aliases: ["tr", "translate", "translation", "translator"],
    description: `Translate your message to any lang you want.`,
    examples: [`trans <lang to trans to> <text to translate>`],
    permissions: 'none',
    permissionsMe: ['none'],
    ownerOnly: false,
    file: __filename,
    arguments: [
      { name: 'text_string', description: 'Text to translate.', required: true },
      { name: 'to_lang_string', description: 'Language to translate to.', required: false },
    ]
  },
  async run(bot, message, args) {

    let say = await message.options.getString("text_string") || null
    let toLang = await message.options.getString("to_lang_string") || 'EN'

    let url = `https://api.c99.nl/translate?key=${moduleHolder.Modules.private.apiKeys.c99}&text=${say}&tolanguage=${toLang.toUpperCase()}&json`
    url = encodeURI(url);

    moduleHolder.Modules.nodefetch(url, {method: 'get'}).then(async response => {
      let json = await response.json() || null
      if (json && json.success === true) {
        let detected_lang = json.detected_lang;
        let detectedLangName = json.detected_lang_name
        let to_lang = json.to_lang;
        let toLangName = json.to_lang_name
        let original = json.original
        let translated = json.translated;
        let flag_code = ((detected_lang == "en") ? "uk" : detected_lang);

        let flag_code_emojie = ((detected_lang == "en") ? "gb" : detected_lang);
        let flag_code_emojie2 = ((to_lang == "en") ? "gb" : to_lang);

        let embed = new moduleHolder.Modules.discord.EmbedBuilder()
          .setTitle(`Translation from ${detected_lang.toUpperCase()} to ${to_lang.toUpperCase()}`)
          .addFields([
            { name: `:flag_${flag_code_emojie}: ${detectedLangName}`, value: `${decodeURI(original)}` },
            { name: `:flag_${flag_code_emojie2}: ${toLangName}`, value: `${translated ?? "Unknown"}` }
          ])
          // .setThumbnail('https://raw.githubusercontent.com/kreativekorp/vexillo/master/artwork/vexillo/pgc072/' + flag_code + '.png')
          .setTimestamp()
          .setColor(moduleHolder.Modules.discord.Colors.Blue)
          .setFooter({ text: `${moduleHolder.Modules.private.embedFooter}`, iconURL: `${bot.user.displayAvatarURL({ extension: 'png' })}` })
        message.followUp({ embeds: [embed] }).catch(err => console.err);
      } else {
        let errEmbed = new moduleHolder.Modules.discord.EmbedBuilder()
          .setTitle(`${moduleHolder.Modules.emojie.error} ERROR ${moduleHolder.Modules.emojie.error}`)
          .addFields([
            { name: "Error", value: `${response && response.data && response.data.error ? response.data.error : 'Unknown'}` },
            { name: "Response Status", value: `${response && response.status ? response.status : 'Unknown'}` }
          ])

          .setColor(moduleHolder.Modules.discord.Colors.Blue)
          .setFooter({ text: `${moduleHolder.Modules.private.embedFooter}`, iconURL: `${bot.user.displayAvatarURL({ extension: 'png' })}` })
        message.followUp({ embeds: [errEmbed] }).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err);

      }
    }).catch(err => message.followUp(`Oops somthing went whrong: \`${err}\``).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err));

  }
};
