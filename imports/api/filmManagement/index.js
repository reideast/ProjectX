console.log("DEBUG: ran filmManagement/index.js");

console.log("DEBUG: next log should be: publications.js");
import '../../api/filmManagement/server/publications.js';
// import user creation
import './users.js';
// TODO: properly separate out methods, use "export" syntax. look at: https://github.com/meteor/todos/blob/master/imports/api/lists/lists.js
// TODO: these, too:
import './films.js';
import './comments.js';
import './privateMessages.js';
