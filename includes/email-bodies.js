const emailBodies = {
  //* Email body for new user account creation:
  register_body: `
    <p> You have successfully registered for the Exclusions DB.</p>
    <p>For security reasons, before you can begin using the app, an administrator must first 
    activate your account. If you are still unable to login after 24 hours, please contact 
    an administrator at the following email: exclusions@backyarddev.io</p>
    <p>Please note: <em>your login username is the email address you signed up with.</em>
    <p>Thank you for signing up!</p>
    <br>
    <p>Backyard Dev</p>`,
  //* Email body for account being activated:
  account_activated_body: `
    <p> Your account for the Exclusions DB has been successfully activated/reactivated. You may now 
    login and use the application.</p>
    <p>Please click on the following link to access the application: <a href="https://www.mta-exclusions.net">https://www.mta-exclusions.net</a>. You may also copy & paste this link into your browser.</p>
    <p>Please note: <em>your login username is the email address you signed up with.</em>
    <p>Thank you!</p>
    <br>
    <p>Backyard Dev</p>`,
  //* Email body for admin to be notified of a new user account creation:
  new_account_admin: `
    <p> A new account has been created for the MTA Exclusions DB.</p>
    <p>Please click on the following link to view and activate the user: <a href="https://www.mta-exclusions.net">https://www.mta-exclusions.net</a>.</p>
    <p>Thank you!</p>
    <br>
    <p>Backyard Dev</p>`,
  //* Email body for a new exclusion being added to the database:
  new_exclusion_added: `
    <p> This email serves as a notification to inform you that a new exclusion has been added to the MTA Exclusions Database (DB). Please see details below:</p>
    `,
};

module.exports = emailBodies;
