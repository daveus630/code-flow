const mongoose = require('mongoose');
const uuid = require('node-uuid');
const Schema = mongoose.Schema;
require('mongoose-uuid2')(mongoose);
var UUID = mongoose.Types.UUID;

const tokenSchema = new Schema({
    refreshToken: {type: String, unique: true},
    accessToken: {type: UUID, default: uuid.v4},
    expiresIn: {type: String, default: '36000'},
    tokenType: {type: String, default: 'bearer'},
    createdAt: {type: Date, default: Date.now, expires: '3m'},
    consumed: {type: Boolean, default: false},
    userId: {type: String}
  });

  //return mongoose.model('Token', tokenSchema);
//};

//module.exports = new TokenModel();
module.exports = mongoose.model('token', tokenSchema)