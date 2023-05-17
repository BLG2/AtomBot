const ModuleHolder = require('./ModuleHolder');

const moduleHolder = new ModuleHolder();
module.exports = class DiscordBot {
  Bot;
  constructor() {
    this.Bot = new moduleHolder.Modules.discord.Client({
      intents: [
        moduleHolder.Modules.discord.GatewayIntentBits.Guilds,
        moduleHolder.Modules.discord.GatewayIntentBits.DirectMessageReactions,
        moduleHolder.Modules.discord.GatewayIntentBits.DirectMessageTyping,
        moduleHolder.Modules.discord.GatewayIntentBits.DirectMessages,
        moduleHolder.Modules.discord.GatewayIntentBits.GuildBans,
        moduleHolder.Modules.discord.GatewayIntentBits.GuildEmojisAndStickers,
        moduleHolder.Modules.discord.GatewayIntentBits.GuildIntegrations,
        moduleHolder.Modules.discord.GatewayIntentBits.GuildInvites,
        moduleHolder.Modules.discord.GatewayIntentBits.GuildMembers,
        moduleHolder.Modules.discord.GatewayIntentBits.GuildMessageReactions,
        moduleHolder.Modules.discord.GatewayIntentBits.GuildMessageTyping,
        moduleHolder.Modules.discord.GatewayIntentBits.GuildMessages,
        moduleHolder.Modules.discord.GatewayIntentBits.GuildPresences,
        moduleHolder.Modules.discord.GatewayIntentBits.GuildScheduledEvents,
        moduleHolder.Modules.discord.GatewayIntentBits.GuildWebhooks,
        moduleHolder.Modules.discord.GatewayIntentBits.MessageContent,
        moduleHolder.Modules.discord.GatewayIntentBits.GuildVoiceStates
      ],
      partials: [moduleHolder.Modules.discord.Partials.Channel],
      disableEveryone: true,
    });
    this.Bot.SlashCommands = new moduleHolder.Modules.discord.Collection();
    this.Bot.AntiSpamCollection = new moduleHolder.Modules.discord.Collection();
  }

  async Login() {
    console.log("Logging in ...");
    await this.Bot.login(moduleHolder.Modules.private.token);
    await this.commandLoader().catch(e => console.e)
    await this.eventLoader(false).catch(e => console.e)
    await this.loadSlashCommands().catch(e => console.e)
  }

  async Destroy() {
    await bot.destroy()
    process.exit()
  }

  async commandLoader() {
    try {
      // COMMAND LOADER
      const slashFolderPath = moduleHolder.Modules.path.join(`./SlashCommands/`);
      const SlashFolders = moduleHolder.Modules.fs.readdirSync(slashFolderPath) || []
      if (SlashFolders.length !== 0) {
        SlashFolders.map(async f => {
          const slashCmdPath = await moduleHolder.Modules.path.join(`./SlashCommands/${f}/`);
          const SlashCommands = await moduleHolder.Modules.fs.readdirSync(slashCmdPath) || []
          let jsfiles = await SlashCommands.lenght !== 0 ? SlashCommands.filter(f => f.split(".").pop() === "js") : []
          if (jsfiles.length !== 0) {
            await jsfiles.map(async cmd => {
              let slashProps = require(`../SlashCommands/${f}/${cmd}`);
              if (slashProps) {
                
                // delete require.cache[require.resolve(`../../Commands/${f}/${cmd}`)];
                await this.Bot.SlashCommands.set(`${f.toLowerCase()}-${slashProps.help.name.toLowerCase()}`, slashProps)
              }
            })
          }
        })
      }
    } catch (err) {
      console.log(`Error slashcmdloader Function - ${err}`)
    }
  }

  /**
 * @param {Boolean} reloading
 */
  async eventLoader(reloading = false) {
    try {
      // EVENT LOADER
      const filePath = moduleHolder.Modules.path.join(`${__dirname}/../events`);
      const eventFiles = moduleHolder.Modules.fs.readdirSync(filePath);
      eventFiles.map(async eventFile => {
        if (reloading && eventFile.toLowerCase() === 'ready.js') return;
        const event = require(`${filePath}/${eventFile}`)
        const eventName = eventFile.split(".").shift();
        this.Bot.on(eventName, event.bind(null, this.Bot))
      })
    } catch (err) {
      console.log(`Error eventloader Function - ${err}`)
    }
  }


  async loadSlashCommands() {
    try {
      if (this.Bot.user) {
        let subCommads = []
        let commads = []
        const slashFolderPath = moduleHolder.Modules.path.join(`./SlashCommands/`);
        const SlashFolders = moduleHolder.Modules.fs.readdirSync(slashFolderPath) || []
        if (SlashFolders.length !== 0) {
          SlashFolders.map(async f => {
            const slashCmdPath = moduleHolder.Modules.path.join(`./SlashCommands/${f}/`);
            const SlashCommands = moduleHolder.Modules.fs.readdirSync(slashCmdPath) || []
            let jsfiles = SlashCommands.lenght !== 0 ? SlashCommands.filter(f => f.split(".").pop() === "js") : []
            if (jsfiles.length !== 0) {
              let slashcommands = await new moduleHolder.Modules.discord.SlashCommandBuilder().setName(`${f.toLowerCase()}`).setDescription(`${f} commands`);
              await jsfiles.map(async cmd => {
                let slashProps = require(`../SlashCommands/${f}/${cmd}`);
                if (slashProps) {
                  let SubCmd = null
                  await slashcommands.addSubcommand((subcommand) => SubCmd = subcommand)

                  // subCommads.setDefaultPermission(false)

                  if (SubCmd !== null) {
                    subCommads.push(SubCmd)
                    SubCmd.setName(`${slashProps.help.name.toLowerCase()}`)
                    SubCmd.setDescription(`${slashProps.help.description}`)
                    if (slashProps.help.arguments && slashProps.help.arguments.length !== 0) {
                      await slashProps.help.arguments.map(async arg => {
                        if (arg.name.toLowerCase().includes('user')) {
                          SubCmd.addUserOption((option) =>
                            option.setName(`${arg.name.toLowerCase()}`).setDescription(`${arg.description}`).setRequired(arg.required),
                          )
                        }
                        if (arg.name.toLowerCase().includes('boolean')) {
                          SubCmd.addBooleanOption((option) =>
                            option.setName(`${arg.name.toLowerCase()}`).setDescription(`${arg.description}`).setRequired(arg.required),
                          )
                        }
                        if (arg.name.toLowerCase().includes('channel')) {
                          SubCmd.addChannelOption((option) =>
                            option.setName(`${arg.name.toLowerCase()}`).setDescription(`${arg.description}`).setRequired(arg.required),
                          )
                        }
                        if (arg.name.toLowerCase().includes('number')) {
                          SubCmd.addIntegerOption((option) =>
                            option.setName(`${arg.name.toLowerCase()}`).setDescription(`${arg.description}`).setRequired(arg.required),
                          )
                        }
                        if (arg.name.toLowerCase().includes('role')) {
                          SubCmd.addRoleOption((option) =>
                            option.setName(`${arg.name.toLowerCase()}`).setDescription(`${arg.description}`).setRequired(arg.required),
                          )
                        }
                        if (arg.name.toLowerCase().includes('mention')) {
                          SubCmd.addMentionableOption((option) =>
                            option.setName(`${arg.name.toLowerCase()}`).setDescription(`${arg.description}`).setRequired(arg.required),
                          )
                        }
                        if (arg.name.toLowerCase().includes('string')) {
                          let option = null
                          await SubCmd.addStringOption((opt) => option = opt)
                          if (option) {
                            if (arg.options && arg.options.length !== 0) {
                              arg.options.map(opt => {
                                option.addChoices({ name: `${opt}`, value: `${opt}` })
                              })
                            }
                            option.setName(`${arg.name.toLowerCase()}`).setDescription(`${arg.description}`).setRequired(arg.required)
                          }
                        }
                      });
                    }
                  }
                }
              })
              setTimeout(async () => {
                const rawData = await slashcommands.toJSON();
                commads.push(rawData)
              }, 2000)
            }
          })
          setTimeout(async () => {
            const rest = new moduleHolder.Modules.discord.REST({ version: '10' }).setToken(moduleHolder.Modules.private.token);
            await rest.put(moduleHolder.Modules.discord.Routes.applicationCommands(this.Bot.user.id), { body: commads },).then(() => {
              console.log(`Successfully registered slash: ${commads.length} Categorys and ${subCommads.length} Commands.`)
            }).catch(err => {
              console.log(`Err -> ${err}`)
            });
          }, 10000)
        }
      } else { console.log("Bot must be logged in first!") }
    } catch (err) {
      console.log(`Error slashregisterhandler Function - ${err}`)
    }
  }





}
