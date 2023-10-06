const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const Account = new Schema({
  username: String, // valid email address
  password: String,
  first_name: String,
  last_name: String,
  role: String, //null, user, supervisor, admin
  active: Boolean,
  loggedIn: Boolean, // track logged in status
  lastLoggedIn: String, 
  // Added 10/4/23 - For allowing users to receive emails for certain things
  receiveEmail: { 
    newExcl: Boolean, // Default: true
    editedExcl: Boolean, // Default: false
    expiresSoon: Boolean, // Default: false
    expiredExcl: Boolean, // Default: true
  }
});

Account.plugin(passportLocalMongoose);

module.exports = mongoose.model('Account', Account);
