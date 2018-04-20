var mongoose = require('mongoose');
var uuid = require('node-uuid');
require('mongoose-uuid2')(mongoose);
var UUID = mongoose.Types.UUID;

var RefreshTokenModel = function() {
  var refreshTokenSchema = mongoose.Schema({
    token: {type: UUID, default: uuid.v4},
    createdAt: {type: Date, default: Date.now},
    consumed: {type: Boolean, default: false},
    userId: {type: String}
  });

  return mongoose.model('RefreshToken', refreshTokenSchema);
};

module.exports = new RefreshTokenModel();