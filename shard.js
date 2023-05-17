const ModuleHolder = require("./Classes/ModuleHolder");
const moduleHolder = new ModuleHolder()
const manager = new moduleHolder.Modules.discord.ShardingManager("./bot.js", {
    token: moduleHolder.Modules.private.token,
    totalshards: 'auto'
});
manager.spawn();
manager.on("shardCreate", shard => console.log('\x1b[31m', `Shard #${shard.id} is online!`));
manager.on("death", shard => console.log('\x1b[31m', `Shard ${shard.id}'s ChildProcess Exited. Reason Unknown.`));
manager.on("reconnecting", shard => console.log('\x1b[31m', `Shard ${shard.id}'s is attempting to reconnect...`));
manager.on("disconnect", shard => console.log('\x1b[31m', `Shard ${shard.id}'s has disconnected.`));
