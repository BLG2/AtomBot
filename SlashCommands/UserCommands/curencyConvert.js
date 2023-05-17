const ModuleHolder = require("../../Classes/ModuleHolder");
const ValidatorHelperService = require("../../Services/ValidatorHelperService");
const moduleHolder = new ModuleHolder();
const validator = new ValidatorHelperService();

module.exports = {
  help: {
    name: "currencyconvert",
    aliases: ["ccyconvert"],
    description: `Converts normal and cryptocurrencies to any other currency.`,
    examples: [`currencyconvert <amount> <from currency> <to currency>`],
    permissions: 'none',
    permissionsMe: ['none'],
    ownerOnly: false,
    file: __filename,
    arguments: [
      { name: 'amount_string', description: 'Amount to convert.', required: false },
      { name: 'from_currency_string', description: 'Currency i need to convert.', required: false },
      { name: 'to_currency_string', description: 'Currency i need to convert to.', required: false },
    ]
  },
  async run(bot, message, args) {

    let ammount = await message.options.getInteger("amount_number") || 1
    let fromCurency = await message.options.getString("from_currency_string") || 'eur'
    let toCurency = await message.options.getString("to_currency_string") || 'btc'

    if (isNaN(ammount)) return message.followUp(`Pls enter a valid amount.`).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err);

    moduleHolder.Modules.nodefetch(`https://api.c99.nl/currency?key=${moduleHolder.Modules.private.apiKeys.c99}&amount=${Number(ammount)}&from=${fromCurency.toUpperCase()}&to=${toCurency.toUpperCase()}&json`, { method: 'get' }).then(async response => {
      let resp = await response.json() || null
      if (response.status === 200 && resp.success === true) {
        const embed = new moduleHolder.Modules.discord.EmbedBuilder()
          .setTitle(`Currency Converter`)
          .addFields([
            { name: "Amount", value: `${ammount ?? 'Unknown'}` },
            { name: "From", value: `${fromCurency.toUpperCase() ?? 'Unknown'}` },
            { name: "To", value: `${toCurency.toUpperCase() ?? 'Unknown'}` },
            { name: "Result", value: `${resp.amount ? `${resp.amount.toFixed(2)}  (||${resp.amount}||)` : 'Unknown'}` },
          ])
          .setColor(moduleHolder.Modules.discord.Colors.Blue)
          .setFooter({ text: `${moduleHolder.Modules.private.embedFooter}`, iconURL: `${bot.user.displayAvatarURL({ extension: 'png' })}` })
        message.followUp({ embeds: [embed] }).then(message => setTimeout(() => message ? message.delete().catch(e => console.e) : null, 3600000)).catch(err => console.err);
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
    });

  }
};
