var mongoose = require('mongoose');
var uuid = require('node-uuid');
var shortid = require('shortid');
require('mongoose-uuid2')(mongoose);
var UUID = mongoose.Types.UUID;

var AuthCodeModel = function() {
  var authCodeSchema = mongoose.Schema({
    code: {type: UUID, default: uuid.v4},
    createdAt: {type: Date, default: Date.now, expires: '10m'},
    consumed: {type: Boolean, default: false},
    clientId: {type: String},
    userId: {type: String},
    redirectUri: {type: String}
  });

  return mongoose.model('AuthCode', authCodeSchema);
};

module.exports = new AuthCodeModel();
//userId: {type: String, default: shortid.generate},