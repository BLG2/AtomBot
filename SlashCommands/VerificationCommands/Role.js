const VerificationModel = require("../../Models/VerificationModel")
const ModuleHolder = require("../../Classes/ModuleHolder")

const moduleHolder = new ModuleHolder();
module.exports = {
  help: {
    name: "role",
    aliases: [],
    description: `Add or remove a role from the selfrole sys.`,
    examples: [`selfrole <@role>`],
    permissions: 'ManageRoles',
    permissionsMe: ['none'],
    ownerOnly: false,
    file: __filename,
    arguments: [
      { name: 'role', description: 'Role te set.', required: true },
      { name: 'option_string', description: 'role type to set', required: false, options: ["verifyed", "unverifyed"] },
    ]
  },
  async run(bot, message, args) {
    let option = await message.options.getString("option_string") || "verifyed";
    let role = await message.options.getRole("role") || null

    const currentSettings = await bot.verificationServices.GetAsync(message.guild.id) || new VerificationModel(message.guild.id);

    switch (option) {
      case "verifyed":
        currentSettings.VerifiedRoleId = role.id;
        break;
      case "unverifyed":
        currentSettings.UnVerifiedRoleId = role.id;
        break;
    }

    const saved = await bot.verificationServices.SetAsync(currentSettings);
    switch (saved?.acknowledged ?? false) {
      case true:
        let onembed = new moduleHolder.Modules.discord.EmbedBuilder()
          .setDescription(`${moduleHolder.Modules.emojie.succes} verification ${option} role has been set to ${role}`)
          .setColor(moduleHolder.Modules.discord.Colors.Blue)
          .setFooter({ text: `${moduleHolder.Modules.private.embedFooter}`, iconURL: `${bot.user.displayAvatarURL({ extension: 'png' })}` })
        message.followUp({ embeds: [onembed] }).catch(err => console.err);
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
}
