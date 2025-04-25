# AtomBot (old version)
## this bot is an outdated version and has already been rewrited in .NET C# (code stil private) see [Updated Discord Bot](https://github.com/BLG2/AtomBotWeb) for the updated discord bot
Multi purpose DiscordBot made with love by BLG.
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

