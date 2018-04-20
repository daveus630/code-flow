"use strict"

const mongoose = require('mongoose');
const uuid = require('node-uuid');
const Schema = mongoose.Schema;
require('mongoose-uuid2')(mongoose);
var UUID = mongoose.Types.UUID;

const clientSchema = new Schema({
    clientId: {type: UUID, default: uuid.v4, unique: true},
    clientSecret: {type: UUID, default: uuid.v4, unique: true},
    createdAt: {type: Date, default: Date.now},
	email: {type: String, unique: true, required: true, trim: true},
    username: {type: String, unique: true},
	password: {type: String, unique: true},
	passwordConf: {type: String, required: true},
    scope: {type: String},
    userId: {type: String},
    redirectUri: {type: String}
  },
  {
      collection: 'clients'
  }
);

  //return mongoose.model('Client', clientSchema);
//};

//module.exports = new ClientModel();
module.exports = mongoose.model('client', clientSchema)