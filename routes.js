const passport = require('passport');
const moment = require('moment-timezone');
const reCAPTCHA = require('recaptcha2');

const Account = require('./models/account');
const Exclusion = require('./models/exclusion');

const email = require('./emailer');
const emailBodies = require('./includes/email-bodies');

const recaptcha = new reCAPTCHA({
  siteKey: process.env.SITEKEY, // retrieved during setup
  secretKey: process.env.SECRETKEY, // retrieved during setup
});

module.exports = function (app) {
  //* Image embed Howto GET route - displays how to embed Google Photos for linking
  app.get('/home/img_embed_howto', (req, res, next) => {
    if (req.isAuthenticated()) {
      res.render('./exclusions/image-howto');
    } else {
      res.redirect('login');
    }
  });

  //*********** ALL POST ROUTES ************/
  //* Login POST route
  app.post('/login', (req, res) => {
    // Uses passport.js to authenticate user
    const account = new Account({
      username: req.body.username,
      password: req.body.password,
    });

    const currentDate = new Date(); // Store current date & time

    req.login(account, (err) => {
      if (err) {
        console.log(err);
      } else {
        // Validate reCAPTCHA
        recaptcha
          .validateRequest(req)
          .then(() => {
            // If validated, continue with passport authentication process:
            passport.authenticate('local', { failureRedirect: '/retry_login' })(
              req,
              res,
              () => {
                Account.findOne(
                  { username: account.username },
                  async (err, foundUser) => {
                    if (err) {
                      console.log(err);
                    } else {
                      if (foundUser.active) {
                        foundUser.loggedIn = true;
                        foundUser.lastLoggedIn = moment(currentDate)
                          .tz('America/Los_Angeles')
                          .format(); // Update lastLoggedIn
                        await foundUser.save((err) => {
                          if (err) {
                            console.log(err);
                            res.next(err); // err route
                          } else {
                            console.log(
                              `User, ${foundUser.username} has logged in.`
                            );
                            res.redirect('/home');
                          }
                        });
                      } else {
                        console.log(
                          `User ${foundUser.username} is not active and cannot login.`
                        );
                        res.redirect('/unauthorized');
                      }
                    }
                  }
                );
              }
            );
          })
          .catch((err) => {
            // If there is a reCAPTCHA error, redirect to /retry_login route
            console.log('reCAPTCHA was not verified.');
            res.redirect('/retry_login');
          });
      }
    });
  });

  //* Logout POST route https://www.passportjs.org/concepts/authentication/logout/
  app.post('/logout', (req, res, next) => {
    if (req.isAuthenticated()) {
      const loggedInUser = {
        username: req.user.username,
      };
      Account.findOne(
        { username: { $eq: loggedInUser.username } },
        async (err, foundUser) => {
          foundUser.loggedIn = false;
          await foundUser.save((err) => {
            if (err) {
              console.log(err);
              res.next(err); // err route
            } else {
              //Note (not used): Passport 0.6.0^ requires promise cb for req.logout(): req.logout((err) => {...});
              req.session.destroy((err) => {
                // Destroy the session (logout)
                if (err) {
                  console.log(err);
                } else {
                  console.log(`User, ${loggedInUser.username} has logged out.`);
                  res.redirect('/');
                }
              });
            }
          });
        }
      );
    } else {
      res.redirect('/'); // No need to logout - already logged out...
    }
  });

  //* Register POST route (for user registration)
  app.post('/register', (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;
    const userKey = req.body.user_key;
    const firstName = req.body.first_name;
    const lastName = req.body.last_name;
    // Uses passport.js to register a new user, set their auth level
    if (req.body.password === req.body.verify_password) {
      recaptcha
        .validateRequest(req)
        .then(() => {
          Account.register({ username: username }, password, (err, account) => {
            if (err) {
              console.log(err);
              res.redirect('/retry_register');
            } else {
              passport.authenticate('local')(req, res, () => {
                console.log('Registration successful.');
                Account.findOne(
                  { username: username },
                  async (err, foundUser) => {
                    if (err) {
                      console.log(err);
                    } else {
                      const receiveEmail = foundUser.receiveEmail; //newExcl, editedExcl, expiresSoon, expiredExcl
                      foundUser.first_name = firstName;
                      foundUser.last_name = lastName;
                      foundUser.loggedIn = false;
                      // Set defaults for receiveEmail:
                      receiveEmail.newExcl = true;
                      receiveEmail.editedExcl = false;
                      receiveEmail.expiresSoon = false;
                      receiveEmail.expiredExcl = true;
                      // Check if userkey has been inputted, and if it matches criteria
                      if (userKey === process.env.ADMIN_KEY) {
                        //TODO later: change to switch statment
                        foundUser.role = 'admin';
                        foundUser.active = true;
                      } else if (userKey === process.env.SUPV_KEY) {
                        foundUser.role = 'supervisor';
                        foundUser.active = true;
                      } else if (userKey === process.env.USER_KEY) {
                        foundUser.role = 'user';
                        foundUser.active = true;
                      } else {
                        // Invalid user key/no key entered
                        foundUser.role = null;
                        foundUser.active = false;
                      }
                      await foundUser.save((err) => {
                        if (err) {
                          console.log(err);
                          res.next(err); // err route
                        } else {
                          //* Send registration email to new user:
                          email(
                            'Successful Registration - Exclusions DB',
                            `<p>Congrats, ${firstName}!</p> ${emailBodies.register_body}`,
                            username
                          ).catch(console.error);
                          //* Send registration email to site admin:
                          email(
                            'New User Registered - Exclusions DB',
                            `<p>Greetings, Admin!</p> ${emailBodies.new_account_admin} new user: ${foundUser.username} (${foundUser.first_name} ${foundUser.last_name})`,
                            process.env.ADMIN_EMAIL
                          ).catch(console.error);
                          console.log(
                            `New user, ${foundUser.first_name} ${foundUser.last_name} has been registered...`
                          );
                          res.redirect('/register_success');
                        }
                      });
                    }
                  }
                );
              });
            }
          });
        })
        .catch((err) => {
          // If there is a reCAPTCHA error, redirect to /retry_login route
          res.redirect('/register');
        });
    } else {
      // Registration failure. Redirect to /register route:
      res.redirect('/register');
    }
  });

  //* Edit_user POST route
  app.post('/edit_user', (req, res, next) => {
    // Edit a registered user from /edit_user GET route
    let userInfo = {
      username: req.body.email,
      currentPassword: req.body.current_password,
      newPassword: req.body.new_password,
      confirmedPassword: req.body.confirm_password,
      active: req.body.is_active,
      role: req.body.user_role,
      firstName: req.body.first_name,
      lastName: req.body.last_name,
      // Email Notifications:
      eNewExcl: req.body.email_new_excl,
      eEditedExcl: req.body.email_edited_excl,
      eExpiresSoon: req.body.email_expires_soon, //excl expires soon - LOL
      eExpiredExcl: req.body.email_expired_excl,
    };

    Account.findOne({ username: userInfo.username }, async (err, foundUser) => {
      if (err) {
        console.log(err);
      } else {
        const receiveEmail = foundUser.receiveEmail;
        // First, check if the user has updated their password:
        if (
          foundUser.newPassword === foundUser.confirmedPassword &&
          foundUser.newPassword !== ''
        ) {
          // https://alto-palo.com/blogs/nodejs-authentication-with-passportjs-passport-local-mongoose/
          foundUser.changePassword(
            userInfo.currentPassword,
            userInfo.newPassword,
            (err, user) => {
              if (err) {
                console.log(err);
              } else {
                res.render('./users/account-success');
              }
            }
          );
        }
        // Post data to user account:
        foundUser.username = userInfo.username;
        if (
          foundUser.active === false &&
          (userInfo.active === 'on' || userInfo.active === 'true')
        ) {
          //* Send activation email:
          email(
            'Account Activated - Exclusions DB',
            `<p>Greetings, ${foundUser.first_name}!</p> 
             ${emailBodies.account_activated_body}`,
            foundUser.username
          ).catch(console.error);
          foundUser.active = true;
        }
        foundUser.active =
          userInfo.active === 'on' || userInfo.active === 'true' ? true : false;
        foundUser.role = userInfo.role;
        foundUser.first_name = userInfo.firstName;
        foundUser.last_name = userInfo.lastName;
        // Collect email notifications settings:
        // Convert all to boolean values
        receiveEmail.newExcl = 
          userInfo.eNewExcl === 'on' || userInfo.eNewExcl === 'true' ? true : false;
        receiveEmail.editedExcl = 
          userInfo.eEditedExcl === 'on' || userInfo.eEditedExcl === 'true' ? true : false;
        receiveEmail.expiresSoon =
          userInfo.eExpiresSoon === 'on' || userInfo.eExpiresSoon === 'true' ? true : false;
        receiveEmail.expiredExcl =
          userInfo.eExpiredExcl === 'on' || userInfo.eExpiredExcl === 'true' ? true : false;

        await foundUser.save((err) => {
          if (err) {
            console.log(err);
          } else {
            console.log(foundUser.username + ' has been successfully updated.');
            res.render('./users/account-success', { user: userInfo });
          }
        });
      }
    });
  });

  //* Add_exclusion POST route
  app.post('/add_exclusion', async (req, res, next) => {
    // Add new exclusion data from /add_new_exclusion GET route
    let excl = {
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      dob: req.body.dob,
      other_info: req.body.other_info,
      ordinance: req.body.ordinance,
      description: req.body.description,
      detailed_description: req.body.detailed_description,
      date_served: moment(req.body.date_served).format('YYYY-MM-DD'),
      exp_date: req.body.exp_date,
      length: req.body.length, //Note: is converted to a string for 'Lifetime'
      other_length: req.body.other_length,
      img_url: req.body.img_url,
      signature: req.body.signature,
      pending: req.body.pending,
    };

    // If other_length has a value, push that value to length instead.
    if (excl.other_length) {
      excl.length = excl.other_length;
    }

    //* Calculations for adding exclusion length to served date:
    let exclusionLength;
    Date.prototype.addDays = function (days) {
      let date = new Date(this.valueOf());
      date.setDate(date.getDate() + days);
      return date;
    };

    const dateServed = new Date(excl.date_served);
    const dateServedPlus = dateServed.addDays(1);
    console.log(dateServed, dateServedPlus);

    // Checks for which 'length' form field used:
    if (excl.other_length !== null && excl.other_length !== '') {
      excl.exp_date = dateServedPlus.addDays(parseInt(excl.other_length));
    } else {
      excl.exp_date = dateServedPlus.addDays(parseInt(excl.length)); // Add days excl.date_served
    }

    //* Insert data into DB:
    await Exclusion.create(
      [
        {
          first_name: excl.first_name,
          last_name: excl.last_name,
          dob: moment(excl.dob).format('MM/DD/YYYY'),
          other_info: excl.other_info,
          ordinance: excl.ordinance,
          description: excl.description,
          detailed_description: excl.detailed_description,
          date_served: moment(excl.date_served.toString()).format('MM/DD/YYYY'),
          exp_date: moment(excl.exp_date.toString()).format('MM/DD/YYYY'), // convert to string due to "Lifetime"
          length: excl.length === 'Lifetime' ? Infinity : excl.length,
          img_url: excl.img_url,
          signature: excl.signature,
          pending:
            excl.pending === 'on' || excl.pending === 'true' ? true : false,
          archived: false,
        },
      ],
      (err) => {
        if (err) {
          console.log(err);
        } else {
          //* Send new exclusion added success email:
          // TODO: include all users who've selected they wish to be notified
          email(
            'New Exclusion Order Added Successfully! - Exclusions DB',
            `<p>Greetings, ${req.user.first_name}!</p>
               ${emailBodies.new_exclusion_added}<br> Name: ${excl.last_name} ${
              excl.first_name
            }<br> Date: ${excl.date_served} <br>Exclusion Length: ${
              excl.length
            }<br> Pending: ${excl.pending === undefined ? false : true}`,
            [req.user.username, process.env.ADMIN_EMAIL] // Send email to current user and admin
          ).catch(console.error);
          res.redirect('/home');
        }
      }
    );
  });

  //* Edit_exclusion POST route
  app.post('/edit_exclusion', (req, res, next) => {
    // Add a new exclusion from /edit_exclusion GET route
    let excl = {
      id: req.body.id,
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      dob: req.body.dob,
      other_info: req.body.other_info,
      ordinance: req.body.ordinance,
      description: req.body.description,
      detailed_description: req.body.detailed_description,
      date_served: moment(req.body.date_served).format('YYYY-MM-DD'),
      exp_date: req.body.exp_date,
      length: req.body.length,
      img_url: req.body.img_url,
      signature: req.body.signature,
      super_title: req.body.super_title,
      pending: req.body.pending,
    };

    //* Calculations for adding exclusion length to served date:
    let exclusionLength;
    Date.prototype.addDays = function (days) {
      let date = new Date(this.valueOf());
      date.setDate(date.getDate() + days);
      return date;
    };

    const dateServed = new Date(excl.date_served);
    const dateServedPlus = dateServed.addDays(1);

    // Checks for which 'length' form field used:
    if (excl.length !== Infinity && excl.length !== null) {
      excl.exp_date = dateServedPlus.addDays(parseInt(excl.length));
    }

    Exclusion.findOne(
      { _id: { $eq: excl.id } },
      async (err, foundExclusion) => {
        if (err) {
          console.log(err);
        } else {
          // Post data to exclusion:
          foundExclusion.first_name = excl.first_name;
          foundExclusion.last_name = excl.last_name;
          (foundExclusion.dob = moment(excl.dob).format('MM/DD/YYYY')),
            (foundExclusion.other_info = excl.other_info);
          foundExclusion.ordinance = excl.ordinance;
          foundExclusion.description = excl.description;
          foundExclusion.detailed_description = excl.detailed_description;
          foundExclusion.date_served = moment(
            excl.date_served.toString()
          ).format('MM/DD/YYYY');
          foundExclusion.exp_date = moment(excl.exp_date.toString()).format(
            'MM/DD/YYYY'
          );
          foundExclusion.length = excl.length;
          foundExclusion.img_url = excl.img_url;
          foundExclusion.signature = excl.signature;
          foundExclusion.super_title = excl.super_title;
          (foundExclusion.pending =
            excl.pending === 'on' || excl.pending === 'true' ? true : false),
            await foundExclusion.save((err) => {
              if (err) {
                console.log(err);
              } else {
                console.log(
                  foundExclusion.first_name +
                    ' ' +
                    foundExclusion.last_name +
                    ' has been successfully updated.'
                );
                res.redirect('/home');
              }
            });
        }
      }
    );
  });
};
