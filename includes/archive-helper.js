const moment = require('moment');

Date.prototype.addDays = function (days) {
  let date = new Date(this.valueOf());
  date.setDate(date.getDate() + days);
  return date;
};

//* Archive Helper function
// Compare current date to expiration date and return a boolean
function archiveHelper(date)  {
  const currentDate = new Date();
  const expDate = new Date(moment(date, moment.ISO_8601).format('YYYY-MM-DD')); //TODO: Check -- did this work? (ISO)
  const actualExpDate = expDate.addDays(1); // Add on one day for proper calc.
  return currentDate > actualExpDate;
}

module.exports = archiveHelper;