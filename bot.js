const { MongoClient } = require("mongodb");
const DiscordBotApi = require("./Apis/DiscordBotApi");
const MongoDbApi = require("./Apis/MongoDbApi");
const DiscordBot = require("./Classes/DiscordBot");
const Express = require("./Classes/Express");
const ModuleHolder = require("./Classes/ModuleHolder");
const MongoDB = require("./Classes/MongoDB");
const AntiSystemService = require("./Services/AntiSystemService");
const AutoRoleService = require("./Services/AutoRoleService");
const GiveawayService = require("./Services/GiveawayService");
const GuessTheNumberService = require("./Services/GuessTheNumberService");
const GuildSettingServices = require("./Services/GuildSettingServices");
const InviteService = require("./Services/InviteService");
const LevelService = require("./Services/LevelService");
const MemberMessageCountService = require("./Services/MemberMessageCountService");
const SelfRoleService = require("./Services/SelfRoleService");
const ServerStatsService = require("./Services/ServerStatsService");
const TicketService = require("./Services/TicketService");
const VerificationService = require("./Services/VerificationService");
const WarnService = require("./Services/WarnService");

// Calling all the modules
const moduleHolder = new ModuleHolder();

//Discord Bot
const discordBot = new DiscordBot();
discordBot.Login();

//Mongo Client
const mongoDbClient = new MongoClient(moduleHolder.Modules.private.mongoDB)
mongoDbClient.connect().then(client => {
  console.log("Succesfully connected to mongo.")
});
const mongoDb = new MongoDB(mongoDbClient);

//Services
const antiSystemServices = new AntiSystemService(mongoDb);
const warnServices = new WarnService(mongoDb);
const autoRoleServices = new AutoRoleService(mongoDb);
const selfRoleServices = new SelfRoleService(mongoDb);
const serverStatsServices = new ServerStatsService(mongoDb);
const guessTheNumberServices = new GuessTheNumberService(mongoDb);
const giveawayServices = new GiveawayService(mongoDb);
const memberMessageCountServices = new MemberMessageCountService(mongoDb);
const levelServices = new LevelService(mongoDb);
const inviteServices = new InviteService(mongoDb);
const guildSettingsServices = new GuildSettingServices(mongoDb);
const ticketServices = new TicketService(mongoDb);
const verificationServices = new VerificationService(mongoDb);


// Add services to the bot instance so we only wil have 1 instance of the services and also we can call them easely in commands and events
discordBot.Bot.antiSystemServices = antiSystemServices;
discordBot.Bot.warnServices = warnServices;
discordBot.Bot.autoRoleServices = autoRoleServices;
discordBot.Bot.selfRoleServices = selfRoleServices;
discordBot.Bot.serverStatsServices = serverStatsServices;
discordBot.Bot.guessTheNumberServices = guessTheNumberServices;
discordBot.Bot.giveawayServices = giveawayServices;
discordBot.Bot.memberMessageCountServices = memberMessageCountServices;
discordBot.Bot.levelServices = levelServices;
discordBot.Bot.inviteServices = inviteServices;
discordBot.Bot.guildSettingsServices = guildSettingsServices;
discordBot.Bot.ticketServices = ticketServices;
discordBot.Bot.verificationServices = verificationServices;

// create express instance
const express = new Express();

// create db api instance
const mongoDbApi = new MongoDbApi(express, mongoDb);
mongoDbApi.PostGetDbItem();
mongoDbApi.PostUpdateDbItem();

const discordBotApi = new DiscordBotApi(express, discordBot)
discordBotApi.PostCheckMutualServers();
discordBotApi.PostGetGuildInfo();
discordBotApi.PostValidateGuildUser();
discordBotApi.PostSendGuildMessage();
discordBotApi.GetAllCommands();
discordBotApi.GetBotStats();
discordBotApi.PostSendLoginMessage();
discordBotApi.SetMemberRolesAsync();
discordBotApi.StartGiveawayAsync();
discordBotApi.SendTicketMessageAsync();
discordBotApi.CloseTicketAsync();
discordBotApi.ReopenTicketAsync();
discordBotApi.DeleteTicketAsync();




express.StartExpress(8080);
