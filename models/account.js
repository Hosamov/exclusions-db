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
  notifications: { // Added 10/4/2023
    newExclusion: Boolean,
    editedExclusion: Boolean,
    expiringSoon: Boolean,
    expiredExclusion: Boolean,
  }
});

Account.plugin(passportLocalMongoose);

module.exports = mongoose.model('Account', Account);
