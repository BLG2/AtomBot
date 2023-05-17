module.exports = class ModuleHolder {
  Modules;
  constructor() {
    this.Modules = {
      discord: require('discord.js'),
      discordBuilder: require('@discordjs/builders'),
      fs: require("fs"),
      path: require("path"),
      private: require(`${__dirname}/../Settings/Private.json`),
      rateLimiter: require("discord.js-rate-limiter"),
      emojie: require(`${__dirname}/../Settings/Emojies.json`),
      nodefetch: (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args)),
      ms: require("ms"),
      moment: require('moment'),
      express: require('express'),
      bodyParser: require('body-parser'),
      crypto: require("crypto")
    }
  }
}
