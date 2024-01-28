
// Models:
const Exclusion = require('../models/exclusion');
const Account = require('../models/account');

// Helpers:
const archiveHelper = require('./archive-helper');
const emailBodies = require('./email-bodies');
const email = require('../emailer');

const cronJobsHelper = () => {
  //* Task #1
  //! Check for expired (today) or soon-expiring exclusions, send emails based on data.
  Exclusion.find({}, async (err, foundExclusion) => {
    // query all
    console.log('Running task 1: Checking for expiring exclusion orders...');
    if (err) {
      console.log(err);
    } else {
      const currentExclusionsArr = []; // Holds unarchived exclusions
      const emailList = [];

      // Find all users who have opted in to receiving expiration emails:
      Account.find({ username: { $ne: null } }, (err, foundUsers) => {
        foundUsers.forEach((user) => {
          if (user.receiveEmail.expiredExcl)
            emailList.push({
              // object containing email and firstName for sending email
              email: user.username.toString(),
              firstName: user.first_name.toString(),
            });
        });
        // console.log(emailList);
      });

      await foundExclusion.forEach((item) => {
        // Check all unarchived exclusions
        if (!item.archived) {
          //* Verify active or past exclusion using archiveHelper:
          if (
            item.exp_date !== 'Invalid date' &&
            item.exp_date !== 'Infinity' &&
            item.exp_date !== 'Lifetime' &&
            item.length !== 'Lifetime'
          ) {
            item.archived = archiveHelper(item.exp_date); // Returns Boolean
          }

          currentExclusionsArr.push(item);
          if (item.archived) {
            // if the item is marked for archive:
            // Archive all exclusions that have expired
            item.save((err) => {
              if (err) {
                console.log(err);
              } else {
                console.log(item._id + ' has been archived.');
                // Notify applicable users via email:
                emailList.forEach((emailUser) => {
                  email(
                    'Exclusions DB: Exclusion Order Has Expired',
                    `<p>Greetings, ${emailUser.firstName}!</p>
                            ${emailBodies.expired_exclusion}
                            Name: ${item.last_name}, ${item.first_name}<br> 
                            <p>Sincerely,</p>
                            <p>MTA Exclusions DB</p>`,
                    [emailUser.email] // Send email to current user in the series
                  ).catch(console.error);
                });
              }
            });
          }
        }
      });
    }
    console.log('Task 1: completed.');
  });
};

module.exports = cronJobsHelper;
