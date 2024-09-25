# exclusions-db

A exclusions database that is web-based using Node, express and
MongoDB/Mongoose. Used for tracking individuals who are excluded from a service.

## Technologies:

- Node.js
- Express.js
- MongoDB/Mongoose
- Pug.js
- Passport.js

## Features

- User authentication:
  - Google reCAPTCHA
  - Username and password (single-factor)
- User Authorization:
  - User Roles:
    - Admin
      - Full: Create, Read, Update, Delete users and exclusions
      - Can authorize other users.
    - Supervisor
      - Moderate: Create, Read, Update, Delete active exclusions.
      - Can register and update own password.
      - Can read archived exclusions list.
    - User
      - Minimal: Read access for existing exclusions
      - Can register and update own password.
- Exclusions:
  - Authorized users may create exclusion orders via form data sent to mongoDB.
  - Authorized users may edit any active exclusion order.
- Rendering:
  - Exclusions list and exclusion orders are rendered for desktop, mobile, and print.
- Images are currently rendered remotely through Google Photos links.
  - Convert: https://www.labnol.org/embed/google/photos/

# Routes

## GET Routes:

### Routine GET Routes

- / - root, redirects to /login or /home, depending on authentication status
- /login - renders the login page
- /retry_login - A redirect page for unsuccessful login attempts.
- /register - renders the register page, accessible only by Admin for adding new users.
- /unauthorized - basic 'unauthorized' template, contains link to go back to / route.

### Exclusions GET Routes

- /home - renders the exclusions page, displaying all ACTIVE exclusion orders
  - Displays all exclusions, which will be clickable to expand basic data.
    Further clickable to display the whole exclusion order (for print)
  - Button/link for add new exclusion (/add_new_eclusion) (Admin or supervisor only)
  - Link on each card (in exlcusions list) to "edit" (Admin or Supervisor only)
  - Link to archive old/outdated exclusions, or those with a reprieve
  - FEATURE: Sortable based on exclusion length, most recent, or by name
- /add_new_exclusion - renders add new exclusion template (only exclusion page
  outside the /home path)
  - Name - input
  - DOB - input
  - Other info (i.e. gender, height, hair color, etc.) - input
  - Description (what happened, RCW/policy violated) - text area
  - Length of exclusion (3, 7, 14, 30, 60, 180, 365, Lifetime, Other) - dropdown box
    - Other - input
  - Image upload
  - Served Date
  - Expiration Date (optional)
  - Button to save the data
- /home/:exclusion/edit - renders page to edit an exclusion. Accessible by Admin
  or Supervisor users.
- /home/:exclusion/delete - renders delete confirmation page for deleting an
  exclusion order. Accessible by Admin or Supervisor (except for Archived -
  Admin only) user.
- /home/:exclusion/archive - renders page with a text area for explaining why the
  active exclusion is being archived.
- /home/archive - renders list of individuals who have previously been served an
  exclusion order, with the violations.
  /exclusions_data - _WORKING_ renders list of all excludable offenses, with
  minimum suggested exclusion lengths.

### Users GET Routes

- /users - Renders a list of all active users. Accessible by admin
- /users/:user - Renders individual user page for selected user.
- /users/:user/edit_user - Renders edit page for individual/selected user. Accessible by individual/logged
  in user to change own account's password/info. Also accessible by admin -
  editing roles, activating account, resetting password, etc...
- /users/:user/delete_user - After confirmation in /users/:user/confirm_delete,
  Redirects to /users route. Accessible by Admin only.
- /users/:user/confirm_delete - Renders page to confirm deletion of selected
  user. Redirects to /users/:user/delete_user route. Accessible by Admin only.

### Archive GET Routes

- /archive - Renders list of all archived exclusions. Accessible by Admin or Supervisor.
- /archive/:exclusion - Renders individual archived/past exclusion order.
  Accessible by Admin or Supervisor.

## POST Routes:

- \*\* NOTE: POST routes are in routes.js
- /login
- /register (accessibly only by admin)
- /edit_user
- /add_exclusion
- /edit_exclusion
- /archive_exclusion

## 3/2/2023:

- Added 'Pending' exclusion functionality.

## 4/28/2023

- Incorporated "detailed description" on add_exclusion and edit_exclusion post routes.
- Updated front end to gather detailed_description data and display to the user
  on the second page of the exclusion order.
- Made minor adjustments to styling (font sizes)
- Fixed bug that wasn't allowing some pending exclusions to show up in the
  sorted list.

## 7/27/2023

- ✔ Fixed bug that was allowing pending lifetime exclusions be displayed in
  regular lifetime list
- ✔ Fixed auto-populate "Detailed Description" field when a new exclusion is
  added. Also added placeholder values for description and and detailed
  description textareas in new-exclusion.pug.

## 9/14/2023

- ✔ Edited individual PENDING exclusion to display '**/**/\_\_' in "date", "effective",
  and "expires on" lines. Edited exclusions.pug.

## 9/26/2023

- ✔ Fixed bug - home.js line 47: check if pending is $ne TRUE (from false)

## 9/27/2023

- ✔ Fixed mobile style for .excl-container width in max-width: 370
- Adjusted --orange color (buttons) to be brighter/fuller (styles.css)
- Added filter buttons to replace dropdown menu (modernized)
- Added exclusion filter to title
- Added total qualifying exclusions to end of title (after filter)
- Added current date below title. Checked/verified for print

## 9/28/2023

- Added new button styling for selected filter button (styles.css, user-home.pug)
- Adjusted styling for adding new exclusion (changed to button)
- Added preliminary route/view for exclusions-criteria

## 9/29/2023

- Added email confirmation for new exclusions - local/adding user and hard-coded
  admin user only - Greater functionality added to TODOs (below)

## 10/4/2023

- Improved UI - Hyperlink in new-exclusion.pug and edit-exclusion.pug for
  labnol.org after/in Image URL label
- Updated models/account.js - prepare for email notification overhaul

## 10/5/2023

- Add checkboxes for opt-in notifications in /edit_user route
  (edit-user.pug, routes.js)

## 10/18/2023

- Implemented and tested ability for users (who have opted in) to receive email
  notifications for newly added exclusion orders.

## 11/8/2023

- Add a new users/:user/reset_password GET route for sending users a reset
  password email for users to reset their own password. It is still in the
  "brainstorm" phase.

## 11/9/2023

- Removed users/:user/reset_password GET Route
- Added /reset_password POST route (non-functional as of 11/9)

## 11/22/2023

- Worked on adding node-cron package in app.js (for scheduling emails)
  - Still working on this...

## 12/20/2023

- Removed password reset section from /edit_user route
- Adjusted header/banner to include text as well as icons for larger screens
- Setup basic password reset route and template (currently inactive...
  brainstorming how to tackle this one)

## 12/28/2023

- Adjusted wording (improve UI) in email notification for a new exclusion being added
- ✔ Found and fixed bug: Mobile menu was not displaying text, except last li (logout)
  - mobile.css - .fas-icon-light
- Fixed new exclusion email to show a date instead of 'Invalid Date' when no
  date is selected by the user who added it.
- ✔ Added 'date_added' to exclusion schema, made edits to use this as 'Date' on
  exclusions moving forward. Past exclusions will still use 'date_served'. Past
  pending exclusions will still use '**/**/\_\_\_\_'

## 1/1/2024

- app.js (lines 30-104): Implemented cron-job to archive expired exclusion orders.
  - Added email notifications.
  - Set daily task to be run at 1am PST.
  - Tested and it works great as of 1/1/24.

## 1/3/2024

- Cleanup - create cron-jobs.js in /includes to house all cron jobs, which are
  called in app.js. This helper function is called 'cronJobsHelper'

## 1/28/2024

- Fix bug: date was displaying the next day while hosted. incorporated 'moment-timezone' library to set proper timezone (see routes/home.js, and /routes.js)

## PLANNED CHANGES/FEATURES:

- Include list of RCWs/Policy points to choose from during exclusion creation process.
- Add sort by expiring soon.
- Add search feature to find active exclusions easier
- Add section for minimum exclusion lengths (exclusions-criteria GET route)


## TODOS:

- \*\*TODO: Fix exclusion length in edit form (why is it showing an input field vs dropdown?)
- \*\*TODO: Complete email notifications:
  - ✔ New exclusion
  - ❌Changed exclusion
  - ❌Expiring soon
  - ✔ Upon Expiration 1/1/2024
- \*\*TODO: Fix bug: routes.js: edit_user POST route - password updates, should show
  the user an error if it doesn't match,and break from saving the data, instead of
  potentially crashing the server. (tested 11/9 in prod...and it's a sucky one)
  - REMOVE change password in user settings; instead add a "Reset Password" link
    in the /login route
  - \*\*Add ability for users to reset their password via "forgot password" link.

### Originally created: 11/29/2022; Last edited: 1/28/2024
