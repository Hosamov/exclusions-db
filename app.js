const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const session = require('express-session');
const memoryStore = require('memorystore')(session); // used with express-session(?)
const cron = require('node-cron');

require('dotenv/config');

// Passport Config
const Account = require('./models/account');
const { MemoryStore } = require('express-session');
passport.use(new LocalStrategy(Account.authenticate()));
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());

// Initialize DB:
require('./initDB')();

//TODO: cron-job - Add daily tasks here
//! Check for expired (today) or soon-expiring exclusions, send emails based on data.
cron.schedule('0 1 * * *',() => {
    console.log('Running scheduled tasks at 01:00 PST');

  //   Exclusion.find({}, async (err, foundExclusion) => { // query all
  //     console.log('Running task 1: Check for expiring exclusion orders...')
  //     if (err) {
  //       console.log(err);
  //     } else {
  //       const currentExclusionsArr = []; // Holds unarchived exclusions
  //       await foundExclusion.forEach((item) => {
  //         // Check all unarchived exclusions
  //         if (!item.archived) {
  //           //* Verify active or past exclusion using archiveHelper:
  //           if (
  //             item.exp_date !== 'Invalid date' &&
  //             item.exp_date !== 'Infinity' &&
  //             item.exp_date !== 'Lifetime' &&
  //             item.length !== 'Lifetime'
  //           ) {
  //             item.archived = archiveHelper(item.exp_date); // Returns Boolean
  //           }

  //           currentExclusionsArr.push(item);
  //           if (item.archived) { // if the item is marked for archive:
  //             // Archive all exclusions due for archive
  //             item.save((err) => {
  //               if (err) {
  //                 console.log(err);
  //               } else {
  //                 console.log(item._id + ' has been archived.');

  //               }
  //             });
  //           }
  //         }
  //       });
  //     }
  //   })
  },
  {
    scheduled: true,
    timezone: 'America/Los_Angeles',
  }
);

const app = express();

const loginRoute = require('./routes/auth/login.js');
const registerRoute = require('./routes/auth/register.js');
const unauthorizedRoute = require('./routes/auth/unauthorized.js');
const homeRoute = require('./routes/home.js');
const usersRoute = require('./routes/users.js');
const archivesRoute = require('./routes/archive.js');

app.set('view engine', 'pug');

app.use(bodyParser.urlencoded({ extended: true }));
app.use('/static', express.static('public'));
app.use(
  session({
    cookie: { maxAge: 3600000 }, // Expire after 1 hours
    store: new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

//* Filter routes path:
app.use('/', loginRoute); //* /login GET routes
app.use('/', registerRoute); //* /register GET routes
app.use('/', unauthorizedRoute); //* /unauthorized GET route
app.use('/', homeRoute); //* /home GET routes
app.use('/', usersRoute); //* /users GET routes
app.use('/', archivesRoute); //* /archives GET routes

//* Routes
require('./routes')(app);

//* Root(/) GET route
app.get('/', (req, res, next) => {
  res.render('home');
});

//******* ERROR HANDLERS *******//

//* 404 error handler
app.use((req, res, next) => {
  //Create a new the error class object
  const err = new Error();
  err.message = `It appears the page you requested doesn't exist.`;
  err.status = 404;

  // Log out the error code, and stack to the console, including message
  console.log('Error status code: ' + err.status);
  console.log(err.stack);

  // Render the page-not-found template
  res.status(404).render('./errors/page-not-found'); //display a generic 404 page without error stack
});

//* Global error handler
app.use((err, req, res, next) => {
  if (err) {
    if (err.status === 404) {
      res.status(404).render('./errors/page-not-found', { err }); //render the error status with the error
      console.log(err);
    } else {
      err.message = err.message; //|| "Oops, it looks like something went wrong on the server...";
      res.status(err.status || 500).render('./errors/error', { err }); //display the error status and render the error template w/ error message/object
      console.log('Error status code: ' + err.status);
      console.log(err.stack);
    }
  }
});

//* Server
app.listen(process.env.PORT || 3000, () => {
  console.log('Listening on port 3000...');
});
