
// load environmental variables to configure external API keys
console.log("DEBUG: next log should be: configVariables.js");
import './configVariables.js';

// define a starting set of data (if the app is loaded with an empty DB)
// import './fixtures.js';
// TODO: fixtures. see: https://github.com/meteor/todos/blob/master/imports/startup/server/fixtures.js

// load Accounts package's email creation script
console.log("DEBUG: next log should be: email-verify-account.js");
import './email-verify-account.js';

// load rate-limiting, user collection modifying, and other security
// import './security.js';
// TODO: rate-limiting secrurity. see: https://github.com/meteor/todos/blob/master/imports/startup/server/security.js

// load collections, publictions, and Methods to be provided to client as API
console.log("DEBUG: next log should be: register-apis.js");
import './register-apis.js';