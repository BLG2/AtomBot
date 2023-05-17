const { ObjectId } = require('mongodb');
const Express = require('../Classes/Express');
const ModuleHolder = require('../Classes/ModuleHolder');
const MongoDB = require('../Classes/MongoDB');
const AntiSystemModel = require('../Models/AntiSystemModel');
const AutoRoleModel = require('../Models/AutoRoleModel');
const Xor = require('../Services/Xor');
const xor = new Xor();
const moduleHolder = new ModuleHolder();
module.exports = class MongoDbApi {
  Express;
  MongoDb;
  /**
* @param {Express} express
* @param {MongoDB} mongoDb
*/
  constructor(express, mongoDb) {
    this.Express = express;
    this.MongoDb = mongoDb;
  }

  PostGetDbItem() {
    this.Express.App.post('/GetDbItem', async (req, res) => {
      if (req.body && req.body.Data) {
        var decrypted = await xor.Decrypt(req.body.Data) || null;
        let jsonParsed = null;
        try {
          jsonParsed = JSON.parse(decrypted) || null;
        } catch (e) { }
        if (jsonParsed && jsonParsed.DbName && jsonParsed.CollectionName && jsonParsed.SearchKey && jsonParsed.Time) {
          if (jsonParsed.Time > (Date.now() - 30000)) {
            if (jsonParsed.ExpectingArray) {
              let allData = await this.MongoDb.GetAllAsync(jsonParsed.DbName, jsonParsed.CollectionName) || [];
              let filteredData = allData.filter(d => !Object.entries(jsonParsed.SearchKey).map(key => d[key[0]] == key[1]).includes(false)) || [];
              if (filteredData && filteredData.length > 0) {
                var encrypted = await xor.Encrypt(JSON.stringify(filteredData))
                return res.json({ Data: encrypted });
              }
            } else {
              if (jsonParsed.SearchKey._id) jsonParsed.SearchKey._id = new ObjectId(jsonParsed.SearchKey._id);
              let fetchedItem = await this.MongoDb.GetOneAsync(jsonParsed.DbName, jsonParsed.CollectionName, jsonParsed.SearchKey) || null;
              if (fetchedItem) {
                var encrypted = await xor.Encrypt(JSON.stringify(fetchedItem))
                return res.json({ Data: encrypted });
              }
            }
          }
        }
      }
      return res.json(null);
    });
  }


  PostUpdateDbItem() {
    this.Express.App.post('/UpdateDbItem', async (req, res) => {
      if (req.body && req.body.Data) {
        var decrypted = await xor.Decrypt(req.body.Data) || null;
        let jsonParsed = null;
        try {
          jsonParsed = JSON.parse(decrypted) || null;
        } catch (e) { }
        if (jsonParsed && jsonParsed.DbName && jsonParsed.CollectionName && jsonParsed.ModelObject && jsonParsed.Time) {
          if (jsonParsed.Time > (Date.now() - 30000)) {
            let fetchedData = null;
            if (jsonParsed.ModelObject._id) fetchedData = await this.MongoDb.GetOneAsync(jsonParsed.DbName, jsonParsed.CollectionName, { _id: new ObjectId(jsonParsed.ModelObject._id) });
            if (fetchedData) {
              if (JSON.stringify(fetchedData) == JSON.stringify(jsonParsed.ModelObject)) {
                var encrypted = await xor.Encrypt(JSON.stringify({ message: `No changes where made.` }));
                return res.json({ Data: encrypted });
              }
              for (const key in fetchedData) {
                if (!Object.hasOwnProperty.call(jsonParsed.ModelObject, key)) {
                  var encrypted = await xor.Encrypt(JSON.stringify({ message: `Given model is missing property: ${key}, pls contact webAdmin` }));
                  return res.json({ Data: encrypted });
                }
              }
              jsonParsed.ModelObject._id = new ObjectId(jsonParsed.ModelObject._id)
              var encrypted = await xor.Encrypt(JSON.stringify(await this.MongoDb.UpdateOneAsync(jsonParsed.DbName, jsonParsed.CollectionName, fetchedData, jsonParsed.ModelObject)));
              return res.json({ Data: encrypted });
            }

            var encrypted = await xor.Encrypt(JSON.stringify(await this.MongoDb.AddOneAsync(jsonParsed.DbName, jsonParsed.CollectionName, jsonParsed.ModelObject)))
            return res.json({ Data: encrypted });
          }
        }
      }
      return res.json(null);
    });
  }



}
