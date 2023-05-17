const { MongoClient } = require("mongodb");
const ErrorHandler = require("./ErrorHandler");
const ModuleHolder = require("./ModuleHolder");

const moduleHolder = new ModuleHolder();
module.exports = class MongoDB {
  MongoClient;
  /**
  * @param {MongoClient} error
  */
  constructor(mongoClient) {
    this.MongoClient = mongoClient;
  }

  /**
  * @param {String} dbName
  * @param {String} collectionName
  * @param {jsonObject} jsonKey
  */
  async GetOneAsync(dbName, collectionName, jsonKey) {
    try {
      return await this.MongoClient.db(dbName).collection(collectionName).findOne(jsonKey);
    } catch (err) {
      new ErrorHandler(err)
    }
    return null;
  }

  /**
  * @param {String} dbName
  * @param {String} collectionName
  * @param {jsonObject} jsonObject
  */
  async AddOneAsync(dbName, collectionName, jsonObject) {
    try {
      return await this.MongoClient.db(dbName).collection(collectionName).insertOne(jsonObject);
    } catch (err) {
      new ErrorHandler(err)
    }
    return null;
  }

  /**
* @param {String} dbName
* @param {String} collectionName
* @param {jsonObject} oldJsonObject
* @param {jsonObject} newJsonObject
*/
  async UpdateOneAsync(dbName, collectionName, oldJsonObject, newJsonObject) {
    try {
      return await this.MongoClient.db(dbName).collection(collectionName).updateOne(oldJsonObject, { $set: newJsonObject });
    } catch (err) {
      new ErrorHandler(err)
    }
    return null;
  }

  /**
* @param {String} dbName
* @param {String} collectionName
* @param {jsonObject} jsonObject
*/
  async RemoveOneAsync(dbName, collectionName, jsonObject) {
    try {
      return await this.MongoClient.db(dbName).collection(collectionName).deleteOne(jsonObject);
    } catch (err) {
      new ErrorHandler(err)
    }
    return null;
  }

  /**
* @param {String} dbName
* @param {String} collectionName
*/
  async GetAllAsync(dbName, collectionName) {
    try {
      return await this.MongoClient.db(dbName).collection(collectionName).find()?.toArray();
    } catch (err) {
      new ErrorHandler(err)
    }
    return null;
  }

  /**
* @param {String} dbName
* @param {String} collectionName
* @param {String} guildId
*/
  async RemoveAllAsync(dbName, collectionName, guildId = "00") {
    try {
      return await this.MongoClient.db(dbName).collection(collectionName).deleteMany({ GuildId: guildId });
    } catch (err) {
      new ErrorHandler(err)
    }
    return null;
  }



}
