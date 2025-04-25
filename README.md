# AtomBot (old version)
Multi purpose DiscordBot made with love by BLG.

### this bot is an older version and has already been rewrited (code stil pivate) in .NET C# see [Updated Discord Bot](https://github.com/BLG2/AtomBotWeb) for the rewrited version

This bot is not fully ready yet and wil keep growing, also if you find any bug feel free to let me know or fix it yourselves.

[Website Code](https://github.com/BLG2/AtomBotWeb)

[Live preview](https://atom-bot.xyz/)

----------

Make a new file in the Settings folder called "Private.json", then add below content.
```
{
    "token": "BOT_TOKEN",
    "ownerID": "YOUR_DISCORD_ID",
    "xorKey": "RANDOM_KEY_YOU_MADE_UP", //this key is used to encrypt/decrypt the api responses to and from the website
    "errorLog": "DISCORD_CHANNEL_ID",
    "commandLog": "DISCORD_CHANNEL_ID",
    "rebootLog": "DISCORD_CHANNEL_ID",
    "updateChannel": "DISCORD_CHANNEL_ID",
    "panelLogs": "DISCORD_CHANNEL_ID",
    "mongoDB": "MONGODB_CONNECTION_STRING",
    "embedFooter": "AtomBOT",
    "apiKeys": {
        "c99": "API.C99.NL_API_KEY"
    }
}
```

