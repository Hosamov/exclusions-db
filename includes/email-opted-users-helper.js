const Account = require('../models/account');

const emailOptedUsersHelper = (query) => {
  console.log('query is: ' + query)
  //* Import email addresses of all users who selected to be notified
  Account.find({ username: { $ne: null } }, (err, foundUsers) => {
    const emailList = [];
    foundUsers.forEach((user) => {
      if (user.receiveEmail.query)
        emailList.push({
          // object containing email and firstName for sending email
          email: user.username.toString(),
          firstName: user.first_name.toString(),
        });
    });
    console.log(emailList);
    return emailList;
  });
};

module.exports = emailOptedUsersHelper;
